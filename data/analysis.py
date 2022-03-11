import pandas as pd
import numpy as np
import pymc3 as pm
import best
import arviz as az
import matplotlib.pyplot as plt
import glob

az.style.use("arviz-darkgrid")
rng = np.random.default_rng(seed=42)

# import all data
path = "raw"
files = glob.glob(path + "/*.csv")


# this is a bit dense but essentially it is a for loop where the looping
# comes last and the commands first
dta = pd.concat([pd.read_csv(f) for f in files])
dta['symptom2'] = dta['symptom2'].replace('NaN', np.nan).fillna('')
dta['stim'] = dta['symptom1'].astype(str) + dta['symptom2'].astype(str)
dta['stim'] = dta['stim'].astype('category')

stim_map = {'A' : 'A',
            'B' : 'B',
            'C' : 'C',
            'AB' : 'AB',
            'AC' : 'AC',
            'BA' : 'AB',
            'BC' : 'BC',
            'CA' : 'AC',
            'CB' : 'BC'}

## recode physical stim to abstract stim
dta['abstim'] = dta['stim'].map(stim_map)

## get test data
test = dta[dta['phase'] == 'test'][['ppt', 'abstim', 'abresp']]
## group and count data plus make sure it is a DataFrame with reset_index
## unstack and fill value makes sure that each participant has both common and rare value
test = test.groupby(['ppt', 'abstim', 'abresp']).size().unstack(fill_value = 0).reset_index()
test = pd.melt(test, id_vars=['ppt', 'abstim'], var_name='abresp')
## turn counts into probabilities
test['prob'] = test['value'] / 20

bc_rare = test.loc[(test['abstim'] == 'BC') & (test['abresp'] == 'rare')]['prob']
bc_common = test.loc[(test['abstim'] == 'BC') & (test['abresp'] == 'common')]['prob']

best_out = best.analyze_two(bc_rare, bc_common)
fig = best.plot_all(best_out)
fig.show()

best_out.hdi('Difference of means', 0.95)
## HDI interval falls above 0, so we observed the effect

## kruschke's method with pymc3
## TODO: need a lot more info on these things below
μ_m = test['prob'].mean()
μ_s = test['prob'].std() * 2

with pm.Model() as model:
    group1_mean = pm.Normal("group1_mean", mu=μ_m, sigma=μ_s)
    group2_mean = pm.Normal("group2_mean", mu=μ_m, sigma=μ_s)

## set up uniform prior
σ_low = 0
σ_high = 1

with model:
    group1_std = pm.Uniform("group1_std", lower=σ_low, upper=σ_high)
    group2_std = pm.Uniform("group2_std", lower=σ_low, upper=σ_high)

with model:
    ν = pm.Exponential("ν_minus_one", 1 / 29.0) + 1

az.plot_kde(rng.exponential(scale=30, size=10000), fill_kwargs={"alpha": 0.5})
plt.show()

with model:
    λ1 = group1_std ** -2
    λ2 = group2_std ** -2
    group1 = pm.StudentT("rare", nu=ν, mu=group1_mean, lam=λ1, observed=bc_rare)
    group2 = pm.StudentT("common", nu=ν, mu=group2_mean, lam=λ2, observed=bc_common)

with model:
    diff_of_means = pm.Deterministic("difference of means", group1_mean - group2_mean)
    diff_of_stds = pm.Deterministic("difference of stds", group1_std - group2_std)
    effect_size = pm.Deterministic(
        "effect size", diff_of_means / np.sqrt((group1_std ** 2 + group2_std ** 2) / 2)
    )

with model:
    trace = pm.sample(2000, return_inferencedata=True)

az.plot_posterior(
    trace,
    var_names=["difference of means", "difference of stds", "effect size"],
    ref_val=0,
    color="#87ceeb",
)

plt.show()
## 98% of HDI falls above 0

az.plot_posterior(
    trace,
    var_names=["group1_mean", "group2_mean", "group1_std", "group2_std", "ν_minus_one"],
    color="#87ceeb",
)

plt.show()

az.summary(trace, var_names=["difference of means", "difference of stds", "effect size"])
## HDI falls outside of 0, so we observed the effect

## NOTE: https://pypi.org/project/autorank/ is able to calculate Kruschke's method with ROPE
