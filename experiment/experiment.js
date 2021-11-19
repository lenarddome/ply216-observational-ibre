// declare all variables
var trials;
let symptoms;
let disease_keylist;
let acc = 0;
let tmp;
var resp = [];
let permArr = [];
let usedChars = [];
var trials = [];
var testTrials = [];
var testBlock = [];
var trainingCounter = [];

/* ******************************************
 * Create components of the experiment
******************************************* */

/** permute - produce permutations of array with no repeats
 * taken from https://stackoverflow.com/a/9960925/7214634
 * @param {array} input array to be permuted
 * @return {array} all possible permutations of elements from array
 */
function permute(input) {
  let i; let ch;
  for (i = 0; i < input.length; i++) { //   loop over all elements
    ch = input.splice(i, 1)[0]; // 1. pull out each element in turn
    usedChars.push(ch); //   push this element
    if (input.length == 0) { // 2. if input is empty, we pushed every element
      permArr.push(usedChars.slice()); //   so add it as a permutation
    }
    permute(input); // 3. compute the permutation of the smaller array
    input.splice(i, 0, ch); // 4. add the original element to the beginning
    //   making input the same size as when we started
    //   but in a different order
    usedChars.pop(); // 5. remove the element we pushed
  }
  return permArr; // return, but this only matters in the last call
}

// key codes: 88 is X and 89 is Y key
// first element is always common, second element is always rare
disease_keylist = [88, 89];
disease_keylist = jsPsych.randomization.shuffle(disease_keylist);

// inter-trial interval

const intertrial = {
  type: 'html-keyboard-response',
  stimulus: '',
  trial_duration: 500,
  response_ends_trial: false,
  choices: jsPsych.NO_KEYS,
};

// instructions for training phase
const instructionTraining = {
  type: 'html-keyboard-response',
  stimulus: ['<p style="display:inline-block;align:center;font-size:16pt;' +
    'width:60%">' +
    'You will now begin the first phase of the experiment. ' +
    'You will be presented with a variety of different symptoms, and you ' +
    'will be asked to decide whether they belong to Disease X or ' +
    'Disease Y. If you think it is Disease X, press the \'X\' key. If you ' +
    'think it is Disease Y, press the \'Y\' key. You will receive feedback ' +
    'on whether you picked the right disease after every choice. ' +
    '<br><br>You need to complete two consecutive errorless blocks of ' +
    '8 trials to move on to the next phase.</p>' +
    '<br>Press \'space\' to continue.'],
  choices: ['space'],
};

// instructions for test phase
const instructionTest= {
  type: 'html-keyboard-response',
  stimulus: ['<p style="display:inline-block;align:center;font-size:16pt;' +
    'width:60%">'  +
    'Well done on completing the first phase! Now, you will begin ' +
    'the test phase. You will be required to do the same thing as ' +
    'you did before, but without corrective feedback. ' +
    'If you think the symptoms on the screen belong to Disease X, press ' +
    '\'X\'. If you think the symptoms belong to Disease Y, press \'Y\'.<p>' +
    '<p>This phase will have 6 blocks of 12 trials. You will have a chance' +
    ' to rest between blocks.</p>' +
    '<br>Press \'space\' to continue.'],
  choices: ['space'],
};

// welcome message
const welcome = {
  type: 'html-keyboard-response',
  stimulus: ['<p style = "font-size:48px;line-height:2;">' +
        'Welcome to the Experiment! <br> Please press \'space\'.</p>',
  ],
  choices: ['space'],
  // on_start: function(){
  //  var pptID = jatos.urlQueryParameters.id;
  //  jsPsych.data.addProperties({ppt: pptID, session: sessionCurrent});
  // },
};

// between block rest during test
const testRest = {
  type: 'html-keyboard-response',
  stimulus: ['<p style = "font-size:24px;line-height:2;width:600px ">' +
        'You have completed a block. Take ' +
        'a breath and press space when you are ready to continue</p>',
  ],
  choices: ['space'],
};

// remind people to press EXIT EXPERIMTENT button at the end
const creditReminder = {
  type: 'html-keyboard-response',
  stimulus: ['<h1>Point Granting</h1>' +
      '<p style="display:inline-block;align:center;font-size:16pt;' +
      'width:60%">In order to receive the allocated points after completing the experiment, ' +
      'you must read the debrief and click on the <strong> EXIT EXPERIMENT button</strong>.' +
      'Any point will be granted by redirecting you to the SONA website.' +
    '<br><br> Press \'space\' to continue.'],
  choices: ['space'],
};

// debrief
const debrief = {
  type: 'external-html',
  url: 'assets/debrief.html',
  cont_btn: 'exit',
//  on_start: function(){
//    var results = jsPsych.data.get().filter({include:true}).csv();
//    jatos.submitResultData(results);
//    jatos.uploadResultFile(results, sessionCurrent + ".csv")
//      .then(() => console.log("File was successfully uploaded"))
//      .catch(() => console.log("File upload failed"));
//    },
};

// consent form

/* sample function that might be used to check if a subject has given
* consent to participate. If the button is clicked without checking the
* 'I agree' box, prompt participants to check it.
* taken from JSpsych external-html documentation
* @param {boolean} elem True or False boolean
*/
const checkConsent = function(elem) {
  if (document.getElementById('consent_checkbox').checked) {
    return true; // return true if it has been checked
  } else {
    alert('If you wish to participate, you must check the box next to' +
          ' the statement \'I agree to participate in this study.\'');
    return false;
  }
  return false;
};

const consent = {
  type: 'external-html',
  url: 'assets/consent.html',
  cont_btn: 'start',
  check_fn: checkConsent,
};


/* ******************************************
* Create adjective and list
******************************************* */

// taken from https://github.com/aruljohn/popular-baby-names

let girls = ['Emma',
  'Olivia',
  'Ava',
  'Isabella',
  'Sophia',
  'Charlotte',
  'Mia',
  'Amelia',
  'Harper',
  'Evelyn',
  'Abigail',
  'Emily',
  'Elizabeth',
  'Mila',
  'Ella',
  'Avery',
  'Sofia',
  'Camila',
  'Aria',
  'Scarlett',
  'Victoria',
  'Madison',
  'Luna',
  'Grace',
  'Chloe',
  'Penelope',
  'Layla',
  'Riley',
  'Zoey',
  'Nora',
  'Lily',
  'Eleanor',
  'Hannah',
  'Lillian',
  'Addison',
  'Aubrey',
  'Ellie',
  'Stella',
  'Natalie',
  'Zoe',
  'Leah',
  'Hazel',
  'Violet',
  'Aurora',
  'Savannah',
  'Audrey',
  'Brooklyn',
  'Bella',
  'Claire',
  'Skylar']

let boys = ['Liam',
  'Noah',
  'William',
  'James',
  'Oliver',
  'Benjamin',
  'Elijah',
  'Lucas',
  'Mason',
  'Logan',
  'Alexander',
  'Ethan',
  'Jacob',
  'Michael',
  'Daniel',
  'Henry',
  'Jackson',
  'Sebastian',
  'Aiden',
  'Matthew',
  'Samuel',
  'David',
  'Joseph',
  'Carter',
  'Owen',
  'Wyatt',
  'John',
  'Jack',
  'Luke',
  'Jayden',
  'Dylan',
  'Grayson',
  'Levi',
  'Isaac',
  'Gabriel',
  'Julian',
  'Mateo',
  'Anthony',
  'Jaxon',
  'Lincoln',
  'Joshua',
  'Christopher',
  'Andrew',
  'Theodore',
  'Caleb',
  'Ryan',
  'Asher',
  'Nathan',
  'Thomas',
  'Leo']

const names = jsPsych.randomization.shuffle(girls.concat(boys).flat());

/* Create abstract design for both training and test phases */

const trainingItems = [['A', 'B'],
  ['A', 'B'],
  ['A', 'B'],
  ['A', 'C']]; // training trial types

const testItems = [['A'], ['B'], ['C'], ['A'], ['B'], ['C'],
  ['A', 'B'],
  ['B', 'A'],
  ['A', 'C'],
  ['C', 'A'],
  ['B', 'C'],
  ['C', 'B']];

// create physical stimuli
symptoms = ['fever', 'headache', 'rash'];
symptoms = jsPsych.randomization.shuffle(symptoms);

/* *******************************************
 * ********* Create training phase ***********
 ******************************************* */

// permute trainingItems for counterbalancing
for (let i = 0; i < trainingItems.length; i++) {
  tmp = [];
  permArr = [];
  usedChars = [];
  tmp = permute(trainingItems[i]);
  trainingCounter.push(tmp);
}

// combine training blocks (randomize within blocks)
trials = trials.concat(jsPsych.randomization.shuffle(trainingCounter.flat()),
    jsPsych.randomization.shuffle(trainingCounter.flat()),
    jsPsych.randomization.shuffle(trainingCounter.flat()),
    jsPsych.randomization.shuffle(trainingCounter.flat()),
    jsPsych.randomization.shuffle(trainingCounter.flat()));


// combine test blocks (randomize within blocks)
for (let i = 0; i < 6; i++) {
  testTrials = testTrials.concat(
      jsPsych.randomization.shuffle(testItems));
}

const trainingBlock = []; // training matrix
let blk = 1; // block number

for (var i = 0; i < trials.length; i++) {
  // set up individual features
  const symptom1 = symptoms[trials[i][0].charCodeAt(0) - 65];
  const symptom2 = symptoms[trials[i][1].charCodeAt(0) - 65];
  // select correct response key and category based on current stimuli
  if (trials[i].includes('B')) {
    var correct = disease_keylist[0];
    var category = 'common';
  } else if (trials[i].includes('C')) {
    var correct = disease_keylist[1];
    var category = 'rare';
  }
  trainingBlock.push({
    type: 'categorize-html',
    stimulus: ['<p style = "line-height:1.5;font-size:60px">' +
            names[Math.floor((Math.random() * 100))] + ' has ' +
            symptom1 + ' and ' + symptom2 + '<br>which belongs to disease ' +
            String.fromCharCode(correct) + '.</p>'],
    choices: ['space', 'backspace', 'x', 'y'],
    prompt: '<div style="margin-bottom:10px"><p style = "font-size:24px">' +
      'Press space when you are ready.' +
      '</p></div>',
    data: {
      symptom1: trials[i][0],
      symptom2: trials[i][1],
      stimulus: [symptom1, symptom2],
      key: correct, // correct response key
      category: category, // stimuli category
      phase: 'training',
      trial: i + 1,
      include: true,
      block: blk,
    },
    key_answer: correct,
    show_stim_with_feedback: false,
    show_feedback_on_timeout: false,
    correct_text: "",
    incorrect_text: "",
    feedback_duration: 500,
    trial_duration: 5000,
    timeout_message: '<p style = "font-size:42px">Please respond faster!</p>',
    on_finish: function(data) {
      // decode responses into common or rare
      if (disease_keylist.indexOf(data.key_press) === 0) {
        resp = 'common';
      } else if (disease_keylist.indexOf(data.key_press) === 1) {
        resp = 'rare';
      } else {
        resp = 'none';
      };
      data.abresp = resp; // record abstract response
      if (data.key_press === 8) {
        jsPsych.endCurrentTimeline(); // end if backspace is pressed
      }
    },
  });
  trainingBlock.push(intertrial); // intertrial interval
  if (i > 1 && i < 8 && (i + 1) % 8 === 0) {
    trainingBlock.push({
      type: 'html-keyboard-response',
      stimulus: ['<p style = "font-size:24px;line-height:2;width:600px ">' +
            'You have completed a training block. <br>Take ' +
            'a breath and press space when you are ready to continue.</p>'],
      choices: ['space'],
    });
    blk += 1;
  }
  if (i > 1 && i > 8 && (i + 1) % 8 === 0) {
    trainingBlock.push({
      type: 'html-keyboard-response',
      stimulus: ['<p style = "font-size:24px;line-height:2;width:800px ">' +
            'You have completed a training block. Now you have the ' +
            'option to skip the remainder of the training and move straight ' +
            'to the test phase. If you think you need some more time, you ' +
            'can continue with training.<br><br>Take ' +
            'a breath and press space if you wish to continue, or press ' +
            'enter if you wish to skip to the test phase.</p>'],
      choices: ['space', 'enter'],
      on_finish: function(data) {
          if (data.key_press === 13) {
            jsPsych.endCurrentTimeline(); // end if backspace is pressed
          }
      }
    });
    blk += 1;
  }
}

// create training phase timeline element
const trainingPhase = {
  type: 'html-keyboard-response',
  timeline: trainingBlock,
  data: {
    keys: disease_keylist,
  },
};

/* *******************************************
 * *********** Create test phase *************
 ******************************************* */

// compile test phase array with all trials
for (let i = 0; i < testTrials.length; i++) {
  let stim = [];
  let phstim = [];
  let code = [];
  if (typeof testTrials[i][1] !== 'undefined') {
    const symptom1 = symptoms[testTrials[i][0].charCodeAt(0) - 65];
    const symptom2 = symptoms[testTrials[i][1].charCodeAt(0) - 65];
    phstim = [symptom1, symptom2];
    stim = ['<p style = "line-height:2;font-size:60px">' + symptom1 +
              '<br>' + symptom2 + '</p>'];
    code = [testTrials[i][0], testTrials[i][1]];
  } else {
    phstim = symptoms[testTrials[i][0].charCodeAt(0) - 65];
    stim = ['<p style = "font-size:60px">' +
          symptoms[testTrials[i][0].charCodeAt(0) - 65]];
    code = [testTrials[i][0], ''];
  }
  testBlock.push({
    type: 'categorize-html',
    stimulus: stim,
    choices: ['x', 'y'],
    trial_duration: 5000,
    feedback_duration: 1000,
    show_stim_with_feedback: false,
    key_answer: disease_keylist,
    correct_text: '<p style="font-size:30px">Response recorded.</p>',
    incorrect_text: '<p style="font-size:30px">Response recorded.</p>',
    timeout_message: '<p style="font-size:30px">Please respond faster!</p>',
    prompt: '<p style = "font-size:30px">' +
      'Does the patient has disease X or disease Y?' +
      '</p>',
    data: {
      symptom1: code[0],
      symptom2: code[1],
      stimulus: phstim,
      phase: 'test',
      trial: i + 1,
      include: true,
    },
    on_finish: function(data) {
      if (disease_keylist.indexOf(data.key_press) === 0) {
        resp = 'common';
      } else if (disease_keylist.indexOf(data.key_press) === 1) {
        resp = 'rare';
      } else {
        resp = 'none';
      };
      data.abresp = resp;
    },
  });
  testBlock.push(intertrial);
  // have a rest after each block
  if (i > 1 && (i + 1) % 12 === 0) {
    testBlock.push(testRest);
  }
}

// create test phase timeline element
const testPhase = {
  type: 'html-keyboard-response',
  timeline: testBlock,
  data: {
    keys: disease_keylist,
  },
};
