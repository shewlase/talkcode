window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
window.SpeechGrammarList = window.SpeechGrammarList || window.webkitSpeechGrammarList;

let recognition;
// recognition.lang = 'fr-FR';
let validTagCommands = ['heading', 'title', 'paragraph', 'division', 'circle', 'square'];
// let validTagCommands = ['heading', 'title', 'paragraph', 'image', 'picture', 'division'];
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
  startSaySometingTimer(); //should only be online version
  recognition.start();
  setInterval(stopRecognition, 240000);//4 minutes, restart, stops auto stop @ 5mins
}

function startSaySometingTimer()
{
  setTimeout(function()
  {
    setSaid('Almost there...');
    setTimeout(function()
    {
      setSaid('Try talking now');
    }, 4000);
  }, 6000);
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
  //doesnt work
  if(said.innerHTML == 'Reconnecting...' || said.innerHTML == 'Connecting microphone...')
  {
    setSaid('Say something.');
  }
  said.innerHTML = currentCommand;
  currentCommand = currentCommand.toLowerCase();
  lastWord = getLastWord(currentCommand);
  // document.querySelector('input').innerHTML = currentCommand;
  let currentCommandAsList = currentCommand.split(' ');
  let firstWord = currentCommandAsList[0];
  let lastWordRegEx = new RegExp(lastWord, "i");//case insensitive
  let editMode = getEditMode();

  //somehow undo last changes?
  if(lastWord == 'cancel' || lastWord == 'delete')
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
    //clear element numbers
    clearNumbers();
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
    setSaid(' ');
    startIndex = globalTrans.split(" ").length;
  }
  else if(lastWord == 'whoops' || lastWord == 'oops' || lastWord == 'oops' || lastWord == 'undo')//clear everything
  {
    undo();
    startIndex = globalTrans.split(" ").length;
  }
  else if(lastWord == 'help')//clear everything
  {
    toggleHelp();
    startIndex = globalTrans.split(" ").length;
  }

  if(currentCommand.includes('image') || currentCommand.includes('picture'))
  {
    setEditMode('IMAGE');
    startIndex = globalTrans.split(" ").length;
  }

  if(currentCommand.includes('code'))
  {
    toggleCodeWindow();
    startIndex = globalTrans.split(" ").length;
  }
  // else if(lastWord == 'search' && getEditMode() == 'IMAGE')
  // {
  //   getImages(currentCommand.replace('search', ''));
  //   // setSaid('');
  //   startIndex = globalTrans.split(" ").length;
  // }

  if(firstWord == 'edit' || firstWord == 'select')//currentCommandAsList.includes()
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
    let numberCheck = wordIsNumber(firstWord);
    if(numberCheck[0])
    {
      if(numberCheck[1] != firstWord) firstWord = numberCheck[1];
      let number = parseInt(firstWord);
      // setActiveElementWithWord(firstWord);
      addToCommits('Select: '+number);
      setActiveElementById(number);
      startIndex = globalTrans.split(" ").length;
    }

    if(lastWord == contentEndWord)//select div
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
  else if (editMode == 'IMAGE')
  {
    if(lastWord == 'search')
    {
      let searchTerm = currentCommand.replace('search', '');
      if(searchTerm.trim() != '') getImages(searchTerm);
      startIndex = globalTrans.split(" ").length;
    }

    if(wordIsNumber(firstWord)[0])
    {
      let number = parseInt(firstWord);
      // setActiveElementWithWord(firstWord);
      if(number < 7)
      {
        if(checkEditingImage())
        {
          //change src of active element
          addToCommits('Change image');
          changeImageByNumber(number);
        }
        else
        {
          addToCommits('Select image: '+number);
          addImageByNumber(number);
        }
        startIndex = globalTrans.split(" ").length;
      }
    }

    if(currentCommand.includes('previous'))
    {
      changeImagePage(-1);
      startIndex = globalTrans.split(" ").length;
    }
    else if(currentCommand.includes('next'))
    {
      changeImagePage(1);
      startIndex = globalTrans.split(" ").length;
    }

    // if(firstWord)
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
  setSaid('Reconnecting...');
  recognition.start();
  startSaySometingTimer();
}
