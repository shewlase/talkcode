window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
window.SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;

let recognition;
// recognition.lang = 'fr-FR';
let validTagCommands = ['heading', 'title', 'paragraph', 'image', 'picture', 'division'];
// recognition.lang = 'en-US';
let grammar = "#JSGF V1.0; grammar commands; public <commands> = division | heading | clear | yep | title | color | width | height | background | 1 | 2 | 3 | 4"
var speechRecognitionList = new SpeechGrammarList();

let globalTrans;
let contentEndWord = 'yep'; //should tab from content to style to new element
// let startIndex = 0;
let speechStartTime = new Date().getTime();

function initSpeech()
{
  recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.lang = 'en-NZ';
  recognition.interimResults = true;
  speechRecognitionList.addFromString(grammar, 1);
  recognition.grammars = speechRecognitionList;
  // recognition.addEventListener('end', recognition.start);
  recognition.addEventListener('end', startRecognition);//too vague, called on every stop
  // recognition.addEventListener('soundend', startRecognition);
  recognition.addEventListener('result', e =>
  {
      const transcript = Array.from(e.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');


      if (e.results[0].isFinal)
      {
        globalTrans = transcript;
        let transArray = transcript.split(" ");
        let currentCommandAsList = transArray.slice(startIndex);
        currentCommand = currentCommandAsList.join(" ");
        processSpeech(currentCommand);
      }
  });
  recognition.start();
  setInterval(stopRecognition, 240000);//4 minutes, restart, stops auto stop @ 5mins
}

function resetStartIndex()
{
  startIndex = globalTrans.split(" ").length;
}
function setSaid(saidString)
{
  said.innerHTML = saidString;
}
function processSpeech(currentCommand)
{
  // lastWords = transcript;
  lastWord = getLastWord(currentCommand).toLowerCase();
  said.innerHTML = currentCommand;
  // document.querySelector('input').innerHTML = currentCommand;
  let currentCommandAsList = currentCommand.split(' ');
  let firstWord = currentCommandAsList[0];
  let lastWordRegEx = new RegExp(lastWord, "i");//case insensitive
  let editMode = getEditMode();

  //somehow undo last changes?
  if(lastWord == 'cancel')
  {
    deleteActiveElement();
    setEditMode('HOME');
    //only do this if new element
    startIndex = globalTrans.split(" ").length;
  }
  else if(lastWord == 'home')//save
  {
    //save and go home
    // commitEdit(currentCommand.replace('home', ''));//need replace even if Title cased
    commitEdit(currentCommand.replace(lastWordRegEx, ''));
    setActiveElement(resultPage);
    setActiveDiv(resultPage);
    setEditMode('HOME');
    hideElementNumbers();
    startIndex = globalTrans.split(" ").length;
  }
  else if(lastWord == 'reset' || lastWord == 'clear' || lastWord == 'claire' )//clear currentCommand
  {
    startIndex = globalTrans.split(" ").length;
  }
  else if(lastWord == 'cls' )//clear everything
  {
    clearCode();
    setEditMode('HOME');
    startIndex = globalTrans.split(" ").length;
  }
  else if(lastWord == 'exit' )//escape from active div
  {
    setEditMode('HOME');
    exitDiv();//will eventually handle nested divs
    startIndex = globalTrans.split(" ").length;
  }
  else if(lastWord == 'duplicate' )//clear everything
  {
    duplicateActiveElement();
    addToCommits('duplicate');
    // setSaid('');
    startIndex = globalTrans.split(" ").length;
  }

  if(firstWord == 'edit')//currentCommandAsList.includes()
  {
    // currentWordsList[1];
    // let editValue = currentCommandAsList[1];
    startIndex = globalTrans.split(" ").length;
    addToCommits('Mode: Edit');
    setEditMode('SELECT');
  }

  if(editMode == 'HOME')//create new elements from here
  {
    //need match for all
    // if(validTagCommands.includes(firstWord))
    let arrayMatchResult = arrayMatchesAnythingInOther(validTagCommands, currentCommandAsList);
    if(arrayMatchResult[0])
    {
      let matchingWord = currentCommandAsList[arrayMatchResult[1]];
      createElementFromWord(matchingWord);
      // createElementFromWord(firstWord);
      //create the element, set as active element for content
      if(currentCommandAsList.length > 1)
      {
        // replace(something/i, '') // /i is insensitive but to pass variable have to define new Regex()..
        commitEdit(currentCommand.replace(matchingWord, ''));
      }
      else
      {
       // createElementFromWord(firstWord);
      }
      startIndex = globalTrans.split(" ").length;
    }
  }
  else if(editMode == 'SELECT')//select created elements from here
  {
    //not just first word
    let numberWords = ['one', 'two', 'to', 'three', 'for', 'four'];
    // currentCommand contains a number
    let firstWordIsNumber = !isNaN(parseInt(firstWord));
    let firstWordIsNumberWord = numberWords.includes(firstWord);
    if(firstWordIsNumberWord)
    {
      firstWordIsNumber = true;
      let index = numberWords.indexOf(firstWord);
      if(index == 0)
      {
        firstWord = '1';
      }
      else if(index == 1 || index == 2)
      {
        firstWord = '2';
      }
      else if(index == 3)
      {
        firstWord = '3';
      }
      else if(index == 4 || index == 5)
      {
        firstWord = '4';
      }
    }

    if(firstWordIsNumber)
    {
      let number = parseInt(firstWord);
      // setActiveElementWithWord(firstWord);
      addToCommits('Select: '+number);
      setActiveElementById(number);
      startIndex = globalTrans.split(" ").length;
    }

    if(lastWord == contentEndWord)
    {
      setEditMode('STYLE');
      hideElementNumbers();
      startIndex = globalTrans.split(" ").length;
    }
  }
  else if (editMode == 'CONTENT' || editMode == 'STYLE')
  {
    if(lastWord == contentEndWord)
    {
      let commandWithoutEndWord = currentCommand.replace(getLastWord(currentCommand), '');
      // if(getAcviteElement().tagName == 'IMG')
      // {
      //   commitEdit(currentCommand.replace(contentEndWord, ''));//remove end word
      // }
      // else
      // {
        // console.log(currentCommand.replace(contentEndWord, ''));
        commitEdit(commandWithoutEndWord);//remove end word

      // }
      if(editMode == 'CONTENT')
      {
        addToCommits('Content: '+commandWithoutEndWord.trim());
      }
      startIndex = globalTrans.split(" ").length;
      cycleEditMode();
    }
    else
    {
      if(commitEdit(currentCommand))//no return but still breaks code lol
      {
        startIndex = globalTrans.split(" ").length;
      }
    }
  }
  // else if (editMode == 'STYLE')
  // {
  //   document.querySelector('#test').innerHTML = editMode;
  //   commitEdit(currentCommand);
  // }




}

function stopRecognition()
{
  //TODO: inform user of speech reconnection
  recognition.stop();//restart handled by end listener
}

function startRecognition()
{
  // console.log('boop');
  console.log('restart at: '+(new Date().getTime() - speechStartTime)/1000/60);
  startIndex = 0;
  recognition.start();
}
