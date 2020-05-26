let timeSinceLastWord = 0;
let lastWordTime = new Date().getTime();
let lastWords = "";
let lastWord = "";
let closeWords = [];
let wordsToDisplay = [];
let numberContainers = [];
let imageData; //from pexels search
let pageNumber = 1;
//resultDiv container
let activeNumberContainer;

let startIndex = 0;
let codeWindow = document.querySelector('#codeWindow');
let resultPage = document.querySelector('#resultPage');
let said = document.querySelector('#said');
let numbersDiv = document.querySelector('#numbersDiv');
let searchGalleryTop = document.querySelector('#searchGalleryTop');
let searchGalleryBottom = document.querySelector('#searchGalleryBottom');
let imageSelect = document.querySelector('#imageSelect');
let helpText = document.querySelector('#helpText');

let imgFitValues = ['fill', 'contain', 'cover'];

const obsConfig = { attributes: true, childList: true, subtree: true };
let observer;

let display = '';
let wholeCodeString = '';
let fullHtml = '';
let allHtmlLines = [];
let htmlLineArray = [];
let insideDiv = false;
let allDivs = [];
let divContents = [];
let activeElement;
let clearCommandTimer;

let showCodeWindow = false;

// let allValidCommands = ['','','','','','',];
let allElements = [];
let activeDiv;
let editingActiveStyles = false;

const SELECT = 1;
const CONTENT = 2;
const STYLE = 3;
let editMode = 'HOME';

let allCommits = [];
let lastCommit;
let startTime = new Date().getTime();

let isFirstImageSearch = true;
// let allDivs = [];
function init()
{
  // setupObserver();
   observer = new MutationObserver(activeElementChanged);
   allDivs.push(resultPage);
   createNumberContainer();
   activeDiv = resultPage;
   activeDiv.style.border = '2px solid blue';
   setActiveNumberContainer();
   createGalleryControls();
   setTimeout(function()
   {
     initSpeech();
   }, 1000);
   // setActiveDiv(resultPage);
   // activeDiv = resultPage;
}
  //if commandWords.includes([any tag word])
//e.g. title hello
function applyCommand(voiceCommand)
{
  let newElement = generateElementFromWords(voiceCommand);
  //if inside div
  if(insideDiv && newElement != allDivs[allDivs.length-1])
  {
    activeDiv.appendChild(newElement);
  }
  else
  {
    resultPage.appendChild(newElement);
  }
  // renderCode();
  setCodeWindow();
}

// let contentEndWord = 'fox';
//preprocessing html based on text commands
//e.g. heading the title here and color red
function createElementFromWord(tagWord)
{
  let newElement;
  let tag = '';
  addToCommits('Create: '+tagWord);
  if(tagWord == 'heading' || tagWord == 'h' || tagWord == 'title')
  {
    tag = 'h1';
  }
  else if(tagWord == 'paragraph')
  {
    tag = 'p';
  }
  else if(tagWord == 'image' || tagWord == 'picture')//remove
  {
    tag = 'img';
  }
  else if(tagWord == 'division')
  {
    tag = 'div';
  }

  newElement = document.createElement(tag);

  activeDiv.appendChild(newElement);
  // if(activeDiv != null)
  // {
  //   activeDiv.appendChild(newElement);
  // }
  // else
  // {
  //   resultPage.appendChild(newElement);
  // }
  setActiveElement(newElement);
  // cycleEditMode();//from select to content
  editMode = 'CONTENT';
  createElementNumber(newElement);
  if(tag == 'div')
  {
    allDivs.push(newElement);
    createNumberContainer();
    setActiveDiv(newElement);
    // activeDiv = newElement;
  }
  return newElement;
}
//should set activeNumberContainer
function setActiveDiv(div)
{
  if(activeDiv != null) activeDiv.style.border = '';
  activeDiv = div;
  activeDiv.style.border = '2px solid blue';
  if(div != resultPage)
  {
    editMode = 'STYLE';
  }

  //set active number container, active number
  // let divId = allDivs.indexOf(activeDiv);
  // let active
  // let numberContainer = numberContainers[divId][0];
  // let elementsAndNumbers = numberContainers[divId][1];
  setActiveNumberContainer();
}

function createNumberContainer()
{
  let newNumberContainer = document.createElement('DIV');
  newNumberContainer.classList.add('numbersDiv');
  let elementsAndNumbers = [];
  numberContainers.push([newNumberContainer, elementsAndNumbers]);
  document.body.appendChild(newNumberContainer);
  // allElementNumbers
}

function setActiveNumberContainer()
{
  let divId = allDivs.indexOf(activeDiv);
  activeNumberContainer = numberContainers[divId];
}

function addContentToElement(element, contentString)
{
  if(element.tagName == 'IMG')
  {
    //need to either say file format as contentString[1]
      //or check all images files for a match
      //todo: php check if file exists first
    element.src = contentString.toLowerCase()+'.jpg';
  }
  else
  {
    let titleCased = contentString.charAt(0).toUpperCase()+contentString.slice(1);
    element.innerHTML = titleCased;
  }
}

function addToCommits(stringToAdd)
{
  allCommits.push(stringToAdd);
}

function commitEdit(commandString)
{
  // let styleUpdated = false;
  // if(!allCommits.includes(commandString.trim()))  allCommits.push(commandString);
  lastCommit = commandString.trim();
  if(editMode == 'CONTENT')
  {
    addContentToElement(activeElement, commandString.trim());
    // editMode = 'STYLE'; //need thihs to type test, whyyyy

    // editMode++;
    // cycleEditMode();
  }
  else if(editMode == 'STYLE')
  {
    // styleUpdated =
    if(commandString.toLowerCase().split(' ').includes('content'))
    {
      setEditMode('CONTENT');
      addToCommits('Mode: content');
      resetStartIndex();
    }
    else
    {
      addStyleToElement(activeElement, commandString);
    }

    // if(commandString.includes(allCommits[allCommits.length-1]))
    // {
    //   allCommits[allCommits.length-1] = commandString;
    // }
    // else
    // {
    //   if(commandString.trim().length > 0)  allCommits.push(commandString.trim());
    // }
  }
  // document.querySelector('#test').innerHTML = editMode;
  setCodeWindow();
  // return styleUpdated;
  // cycleEditMode();
}


let elementsAndNumbers = [];
//need to differentiate between which childgroup
function createElementNumber(element)
{
  //will be
  // let allDivs = [...resultPage.querySelectorAll('div')];
  let divId = allDivs.indexOf(activeDiv);
  // let numberContainer = numberContainers[divId][0];
  let elementsAndNumbers = numberContainers[divId][1];

  let number = document.createElement('h1');
  number.innerHTML = element.parentNode.childNodes.length;
  number.classList.add('elementNumber');
  activeNumberContainer[1].push([element, number]);
  activeNumberContainer[0].appendChild(number);
  // number.innerHTML = elementsAndNumbers.length+'.';
  // let numberOfElements
  //get child number within current div
  // number.innerHTML = resultPage.childNodes.length;

  //will be current number div, depending on current div
  // numbersDiv.appendChild(number);
  console.log(elementsAndNumbers.length);
  refreshNumberPositions();
}

function showNumbersFor(div)
{
  let divId = allDivs.indexOf(activeDiv);
  let numberContainer = numberContainers[divId][0];
  let elementsAndNumbers = numberContainers[divId][1];
  numberContainer.style.display = 'block';
}

function showElementNumbers()
{
  // let allElements = resultPage.childNodes;
  //get top and left, add width of codewindow + border, create absolute
  //   elements with top and left (maybe )
  //    could create at create element
  refreshNumberPositions();
  activeNumberContainer[0].style.display = 'block';
}

function hideElementNumbers()
{
  // numbersDiv.style.display = 'none';
  activeNumberContainer[0].style.display = 'none';

}

function refreshNumberPositions()
{
  numberContainers.forEach(function(numberContainer)
  {
    // activeNumberContainer[1].forEach(function(elAndNum)
    numberContainer[1].forEach(function(elAndNum)
    {
      let element = elAndNum[0];
      let number = elAndNum[1];
      let elRect = element.getBoundingClientRect();
      // let resultDivX = resultPage.getBoundingClientRect().left;
      // let resultDivX = resultPage.getBoundingClientRect().left;
      // number.style.top = (elRect.top+resultDivX)+'px';
      number.style.top = elRect.top+0.5*elRect.height+'px';
      number.style.left = elRect.left+0.5*elRect.width+'px';
      // number.style.left = (elRect.left-resultDivX)+'px';
    });
  });
}

function getAcviteElement()
{
  return activeElement;
}

function setActiveElement(element)
{
  unHighlightActive();
  activeElement = element;

  observer.disconnect();
  //observe element
  // Start observing the target node for configured mutations
  observer.observe(activeElement, obsConfig);
  // Later, you can stop observing

  highlightActiveElement();
  // if(element.tagName == 'DIV')
  // {
  //   setActiveDiv(element);
  // }
  setEditMode('STYLE');

  // setEditMode('CONTENT');
}

function setActiveElementById(id)
{
  let hackId = Math.floor(id);
  //need id of currently showing div
  // setActiveElement(resultPage.childNodes[hackId-1]);
  // let selectedElement = activeNumberContainer[0].childNodes[hackId-1];
  let selectedElement = activeNumberContainer[1][hackId-1][0];
  setActiveElement(selectedElement);
  hideElementNumbers();

  if(activeElement.tagName == 'DIV')
  {
    // hideElementNumbers();
    setActiveDiv(selectedElement);
    showElementNumbers();
    setEditMode('SELECT');
  }
  else
  {
  }
  // setEditMode('STYLE');
}

function setActiveElementWithWord(stringNumber)
{
  let intNumber = parseInt(stringNumber);
  //need display error if no such number
  setActiveElement(resultPage.childNodes[intNumber-1]);
  // setEditMode('STYLE');
  //if div, skip content mode

}

function deleteActiveElement()
{
  if(activeElement != null)
  {
    activeElement.parentNode.removeChild(activeElement);
  }
  unHighlightActive();
}
//different color for content and style
function highlightActiveElement()
{
  activeElement.style.outline = '0.3vw solid yellow';
  if(activeElement.tagName == 'DIV')
  {
    activeElement.style.outline = '0.3vw solid blue';
  }
}

function unHighlightActive()
{
  if(activeElement != null)
  {
    activeElement.style.outline = '';
    activeElement = null;
  }
}
//home, content, style, select, image
function setEditMode(mode)
{
  editMode = mode;
  if(mode == 'HOME')//should be create
  {
    //if from 'home' active element resultPage
    // else dont change
    //hide numbers

    unHighlightActive();//when done editing style, unhighlight
    // hideElementNumbers();

    // setActiveDiv(resultPage);
    // activeDiv = null;//only if
  }
  else if (mode == 'SELECT')//'edit'
  {
    showElementNumbers();
    //show numbers for activeDiv
  }
  else if(mode == 'IMAGE')
  {
    showImageSearch();
  }
  // if(mode != 'SELECT')
  if(mode == 'STYLE')
  {
    // hideElementNumbers();
  }
  document.querySelector('#test').innerHTML = editMode;
}

function wordIsNumber(word)
{
  let numberWords = ['one', 'two', 'to', 'three', 'for', 'four'];
  // currentCommand contains a number
  let firstWordIsNumber = !isNaN(parseInt(word));
  let firstWordIsNumberWord = numberWords.includes(word);
  if(firstWordIsNumberWord)
  {
    firstWordIsNumber = true;
    let index = numberWords.indexOf(word);
    if(index == 0)
    {
      word = '1';
    }
    else if(index == 1 || index == 2)
    {
      word = '2';
    }
    else if(index == 3)
    {
      word = '3';
    }
    else if(index == 4 || index == 5)
    {
      word = '4';
    }
  }
  let result = [firstWordIsNumber, word];
  return result;
}

function exitDiv()
{
  // activeDiv = resultPage;
  setActiveDiv(resultPage);
}

function cycleEditMode()
{
  if(editMode == 'CONTENT')
  {
    setEditMode('STYLE');
  }
  else if(editMode == 'STYLE')
  {
    setEditMode('HOME');
  }
}

function getEditMode()
{
  return editMode;
}

// Callback function to execute when mutations are observed
const activeElementChanged = function(mutationsList, observer)
{
    // Use traditional 'for loops' for IE 11
    for(let mutation of mutationsList)
    {
        if (mutation.type === 'childList')
        {
            // console.log('A child node has been added or removed.');
        }
        else if (mutation.type === 'attributes' && editMode == 'STYLE')
        {
            // console.log('The ' + mutation.attributeName + ' attribute was modified.');
            //need check for numbers i.e. from 2 to 20 to 25, need to wait
            //add last command to commits
            addToCommits('Style: '+lastCommit);

            clearTimeout(clearCommandTimer);
            clearCommandTimer = setTimeout(function()
            {
              setSaid('');
              resetStartIndex();
            }, 800);
            // if(mutation.oldValue == null)
            // {
            //   clearTimeout(clearCommandTimer);
            //   clearCommandTimer = setTimeout(function()
            //   {
            //     resetStartIndex();
            //   }, 3000);
            // }
            // else
            // {
            // }
        }
    }
};

function addStyleToElement(element, commandString)
{

  let wordsAsArray = commandString.toLowerCase().split(' ');
  let styleUpdated = false;
  let wordIndex = -1;
  // let endContentIndex = wordsAsArray.indexOf(contentEndWord);
  // let contentArray = wordsAsArray.slice(1, endContentIndex);
  // content = contentArray.join(' ');
  // content = commandString;

  if(wordsAsArray.includes('caps'))
  {
    let oldInner = element.innerHTML;
    element.innerHTML = oldInner.toUpperCase();
  }

  if(wordsAsArray.includes('opacity'))
  {
    wordIndex = wordsAsArray.indexOf('opacity')+1;
    element.style.opacity = wordsAsArray[wordIndex];
  }

  if(wordsAsArray.includes('colour'))
  {
    wordIndex = wordsAsArray.indexOf('colour')+1;
    element.style.color = wordsAsArray[wordIndex];
  }

  if(wordsAsArray.includes('background'))
  {
    wordIndex = wordsAsArray.indexOf('background')+1;
    styleUpdated = true;
    element.style.backgroundColor = wordsAsArray[wordIndex];
  }


  //HACKY: NEED validWidthCommands['with', 'width', 'which', 'thickness']
  if(wordsAsArray.includes('with')) //thickness/width
  {
      wordIndex = wordsAsArray.indexOf('with')+1;
      //check if word or number and convert to number
      element.style.width = wordsAsArray[wordIndex]+'%';
  }
  if(wordsAsArray.includes('width')) //thickness/width
  {
      wordIndex = wordsAsArray.indexOf('width')+1;
      //check if word or number and convert to number
      element.style.width = wordsAsArray[wordIndex]+'%';
  }
  if(wordsAsArray.includes('which')) //thickness/width
  {
      wordIndex = wordsAsArray.indexOf('which')+1;
      //check if word or number and convert to number
      element.style.width = wordsAsArray[wordIndex]+'%';
  }
  //lastindexof, need check if next to eachother
  if(wordsAsArray.includes('height'))//how to take last spoken value? or delete rendered ones
  {
      wordIndex = wordsAsArray.indexOf('height')+1;
      //check if word or number and convert to number
      element.style.height = wordsAsArray[wordIndex]+'%';
  }

  if(wordsAsArray.includes('top'))
  {
      wordIndex = wordsAsArray.indexOf('top')+1;
      //check if word or number and convert to number
      element.style.top = wordsAsArray[wordIndex]+'%';
      // element.style.marginTop = wordsAsArray[topWordIndex]+'%';
  }

  if(wordsAsArray.includes('left'))
  {
    wordIndex = wordsAsArray.indexOf('left')+1;
    //check if word or number and convert to number
    // element.style.marginLeft = wordsAsArray[wordIndex]+'%';
    element.style.left = wordsAsArray[wordIndex]+'%';
  }

  if(wordsAsArray.includes('size'))
  {
    wordIndex = wordsAsArray.indexOf('size')+1;
    //check if word or number and convert to number
    element.style.fontSize = wordsAsArray[wordIndex]+'vw';
  }

  if(wordsAsArray.includes('padding'))
  {
    wordIndex = wordsAsArray.indexOf('padding')+1;
    //check if word or number and convert to number
    element.style.padding = wordsAsArray[wordIndex]+'vw';
  }

  if(wordsAsArray.includes('margin'))
  {
    wordIndex = wordsAsArray.indexOf('margin')+1;
    //check if word or number and convert to number
    element.style.margin = wordsAsArray[wordIndex]+'vw';
  }
  if(wordsAsArray.includes('rotate'))
  {
    wordIndex = wordsAsArray.indexOf('rotate')+1;
    //check if word or number and convert to number
    element.style.transform = "rotate("+wordsAsArray[wordIndex]+"deg)";
  }

  //CHECK IF WORD AFTER STYLE WORD IS EMPTY, only for value setting
  if(wordIndex != -1)
  {
    // console.log('wordIndex'+wordIndex);
    let styleValue = wordsAsArray[wordIndex];
    // if(!isNaN(styleValue)) styleValue = styleValue.trim();
    // if(styleValue.length > 1)
    if(!isNaN(styleValue))
    {
      // styleUpdated = false;
      //CHECK IF it is a number, how differentiate between word/number styles
      if(isNaN(parseFloat(styleValue)))
      {
        clearTimeout(clearCommandTimer);
        clearCommandTimer = setTimeout(function()
        {
          setSaid('');
          resetStartIndex();
        }, 500);
      }
    }
  }

  if(wordsAsArray.includes('absolute'))
  {
    element.style.position = 'absolute';
  }

  if(wordsAsArray.includes('center') || wordsAsArray.includes('centre'))
  {
    element.style.textAlign = 'center';
  }

    // const hasFitValue = (word) => imgFitValues.includes(word);
  let matchIndex = 0;
  const hasFitValue = function(word, i)
  {
    if(imgFitValues.includes(word))
    {
      matchIndex = i;
      return true;
    }
  }
  //need imgFitValues[indexOfMatch]
  if(wordsAsArray.some(hasFitValue) && element.tagName == 'IMG')
  {
    element.style.objectFit = wordsAsArray[matchIndex];
  }

  return styleUpdated;

  // if(tag == 'img')
  // {
  //   element.src = source+'.jpg';
  // }
  // else if(tag == 'div')
  // {
  //   element.innerHTML = "";
  //   allDivs.push(element);
  //   enterDiv(allDivs.length-1);
  // }
}

function duplicateActiveElement()
{
  let cloneNode = activeElement.cloneNode(true);
  // cloneNode.style.outline = ''; //?
  // activeElement.parentNode.insertBefore(cloneNode, activeElement);
  activeElement.parentNode.appendChild(cloneNode)
  setActiveElement(cloneNode);

  if(cloneNode.tagName == 'div')
  {
    setActiveDiv(cloneNode);
  }
  // else
  // {
    createElementNumber(cloneNode);//need update each time shown
  // }
  // resultPage.appendChild(cloneNode);
}

function arrayMatchesAnythingInOther(arrayOne, arrayTwo)
{
  // let match, index;
  let index;
  let resultAndIndex = [false, -1];
  const hasArrayOneValue = function(word, i)
  {
    if(arrayOne.includes(word))
    {
      // match = word;
      index = i;
      resultAndIndex[1] = i;
      return true;
    }
    // return arrayOne.includes(word);
  }
  resultAndIndex[0] = arrayTwo.some(hasArrayOneValue);
  return resultAndIndex;
}

function enterDiv(divPosition)
{
  //all new commands, html added within div
  // activeDiv = allDivs[divPosition];
  setActiveDiv(allDivs[divPosition]);
  insideDiv = true;
}

function exitDiv()
{
  activeDiv = null;
  insideDiv = false;
}

function clearCode()
{
  fullHtml = '';
  allHtmlLines = [];
  htmlLineArray = [];
  renderCode();
  setCodeWindow();
}

function updatePagePreview()
{
  resultPage.appendChild();
}
//NOT USED
function renderCode()
{

  resultPage.innerHTML = allHtmlLines.join(" ");
  // resultPage.innerHTML = fullHtml;
  // resultPage.innerHTML = htmlString;
}

//should just render last added line? / edited lines
function setCodeWindow()
{
  // Use &lt; for <.     Or &gt; for >.
  //need <br> near div tags
  // let asFullString = htmlLineArray.join('<br>');
  let asFullString = resultPage.innerHTML;
  let fixedString = asFullString.replace(/</g, '&lt');
  fixedString = fixedString.replace(/>/g, '&gt');
  fixedString = fixedString.replace(/&ltimg/g, '<br>&ltimg');
  fixedString = fixedString.replace(/&lth1/g, '<br>&lth1');
  fixedString = fixedString.replace(/&ltp/g, '<br>&ltp');
  fixedString = fixedString.replace(/&ltdiv/g, '<br>&ltdiv');
  fixedString = fixedString.replace(/&lt\/div/g, '<br>&lt/div');

  //<img> to <br><img>, <h1> to <br><h1> </div> and <div> to <br>
  // fixedString = fixedString.replace(/&lt/g, '<br>&lt');
  codeWindow.querySelector('code').innerHTML = fixedString;

  // codeWindow.querySelector('pre').innerHTML = process(fixedString);
}

function getLastWord(words)
{
  var n = words.split(" ");
  return n[n.length - 1];
}


var textFile = null;
function makeTextFile(resultHtml)
{
    let htmlEl = document.createElement('div');
    let head = document.querySelector('head');
    htmlEl.appendChild(head);

    let mainContainer = document.createElement('div');
    mainContainer.id = 'resultPage'; //required styles, will be set by user in future
    mainContainer.innerHTML = resultHtml;
    mainContainer.style.cssText = "font-family: 'Fascinate', serif; width: 75vw; background-color: white; top: 0;	left:0;	position: relative; flex-wrap: wrap;";
    htmlEl.appendChild(mainContainer);
    let fullText = htmlEl.innerHTML;
    //mainContainer.querySelectorAll('div').style.cssText =
    // #resultPage div
    // {
    // 	display: flex;
    // 	align-content: flex-start;
    // }";
    // this with resultPage styles

    // this with all fonts instead of entire head
    // <link href="https://fonts.googleapis.com/css2?family=Fascinate&display=swap" rel="stylesheet">


    var data = new Blob([fullText], {type: 'text/html'});
    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if(textFile !== null)
    {
      window.URL.revokeObjectURL(textFile);
    }

    textFile = window.URL.createObjectURL(data);
    document.querySelector('#test').href = textFile;//save target as
}

// +1 or -1
function changeImagePage(direction)
{
  pageNumber += direction;
  if(pageNumber < 1) pageNumber = 1;
  if(pageNumber > 4) pageNumber = 4;//should research? or just get more from first call
  refreshGallery();
}

function refreshGallery()
{
	// var src = d.photos[0].src.large;
	// var randomNumber = Math.floor(Math.random()*10);
  let allTopSeachImages = searchGalleryTop.querySelectorAll('img');
  let allBotSeachImages = searchGalleryBottom.querySelectorAll('img');
  // imageData = d;
  // for(let i = 0; i < 6; i++)
  for(let i = 0; i < 3; i++)
  {
    var srcTop = imageData.photos[i+(pageNumber*6)].src.large;
    var srcBot = imageData.photos[i+3+(pageNumber*6)].src.large;
    allTopSeachImages[i].src = srcTop;
    allBotSeachImages[i].src = srcBot;
  }
	// var src = d.photos[randomNumber].src.large;1
	// document.getElementById('topImg').src = src;
}

function addImageByNumber(number) //1-6
{
  let newImage = document.createElement('IMG');
  let allTopSeachImages = searchGalleryTop.querySelectorAll('img');
  let allBotSeachImages = searchGalleryBottom.querySelectorAll('img');
  //src to match number
  //1-3 allTopSeachImages
  if(number < 4)
  {
    newImage.src = allTopSeachImages[number-1].src;
  }
  else
  {
    newImage.src = allBotSeachImages[number-4].src;
  }
  imageSelect.style.opacity = '0.0';
  activeDiv.appendChild(newImage);
  setActiveElement(newImage);
  createElementNumber(newImage);
  if(isFirstImageSearch)
  {
    isFirstImageSearch = false;
    helpText.style.opacity = 0;
  }
}

//numbers and next/previous labels
function createGalleryControls()
{
  let allTopSeachImages = searchGalleryTop.querySelectorAll('img');
  let allBotSeachImages = searchGalleryBottom.querySelectorAll('img');
  let top3Y = searchGalleryTop.getBoundingClientRect().bottom -100;
  let bot3Y = searchGalleryBottom.getBoundingClientRect().top+ 100;
  for(let i = 0; i < 3; i++)
  {
    let number = document.createElement('h1');
    let botNumber = document.createElement('h1');
    number.innerHTML = i+1;
    number.classList.add('elementNumber');
    botNumber.innerHTML = i+4;
    botNumber.classList.add('elementNumber');
    // number.style.marginLeft = '20%';


    //top 3, bottom = galery top bottom, left = image
    //bottom 3, top = galery bottom top, left = image
    let test = allTopSeachImages[i].getBoundingClientRect().left;
    number.style.left = allTopSeachImages[i].getBoundingClientRect().left+'px';
    botNumber.style.left = allBotSeachImages[i].getBoundingClientRect().left+'px';
    number.style.top = top3Y+'px';
    botNumber.style.top = bot3Y+'px';

    document.querySelector('#imageNumbers').appendChild(number);
    document.querySelector('#imageNumbers').appendChild(botNumber);

    imageSelect.querySelectorAll('h1')[0].style.position = 'absolute';
    imageSelect.querySelectorAll('h1')[1].style.position = 'absolute';
    imageSelect.querySelectorAll('h1')[0].style.top = '70vh';
    imageSelect.querySelectorAll('h1')[1].style.top = '70vh';
    imageSelect.querySelectorAll('h1')[1].style.right = '0';

    // });
    // allBotSeachImages[i].src = srcBot;
  }
}

var pexelsKey = '563492ad6f91700001000001da0ffdd88dd64342b698ac6fb52e2a29';
function getImages(searchTerm)
{
  helpText.innerHTML = 'Say the number of the image to add  <br> to site or "next" to see more';

  let fetchData =
	{
		"method": "GET",
	   "headers":
	 	{
	    "Authorization": pexelsKey
		}
	}
	// fetch('https://api.pexels.com/videos/search?query='+searchTerm+'&per_page=30&page=1', fetchData)
	fetch('https://api.pexels.com/v1/search?query='+searchTerm+'&per_page=30&page=1', fetchData)
	.then(function(resp) { return resp.json() }) // Convert data to json
	.then(function(data)
	{
		// drawWeather(data);
    imageData = data;
		refreshGallery(1);
	})
	.catch(function() {
		// catch any errors
	});
}

function showImageSearch()
{
  // imageSelect.style.display = "block";
  if(isFirstImageSearch)
  {
    helpText.innerHTML = 'Try say "banana" then <br> "search" or "dog search"';
  }
  imageSelect.style.opacity = "1.0";
}

function toggleCodeWindow()
{
  showCodeWindow = !showCodeWindow;
  if(showCodeWindow)
  {
    codeWindow.style.left = '0';
  }
  else
  {
    codeWindow.style.left = '-25vw';
  }
}

// document.querySelector('input').onkeydown = function(evt)
// {
//   let input = evt.target;
//   //
//   // globalTrans += input.value;
//   // // startIndex = globalTrans.split(" ").length;
//   // processSpeech(input.value);
//   // // applyCommand(input.value);
//   // input.value = '';
//   switch(evt.keyCode)
//   {
//     //get value and applyCommand
//     case 13:  //enter
//     globalTrans += input.value;
//     // startIndex = globalTrans.split(" ").length;
//     processSpeech(input.value);
//     // applyCommand(input.value);
//     input.value = '';
//     break
//   }
// }

resultPage.onmousedown = function(evt)
{
  let clickElement = evt.target;
  setActiveElement(evt.target);
  // if(clickElement != resultPage)
  // {
  // }

  if(clickElement.tagName == 'DIV')
  {
    //show numbers f this div
    // setActiveElement(evt.target);

    // setActiveElement(evt.target);

    hideElementNumbers();
    setActiveDiv(clickElement);
    showElementNumbers();
    // showNumbersFor(clickElement);
    // refreshNumberPositions();
  }
  // editMode = 'STYLE';
  resetStartIndex();
}

document.onkeydown = function(evt)
{
  switch(evt.key)
  {
    case "Escape":
      setEditMode('HOME');
      break
    case "d":
      makeTextFile(resultPage.innerHTML);
      break
    case "f":
      console.log(allCommits);
      break
    case "q":
      // stopRecognition();
      console.log((new Date().getTime() - startTime)/1000/60);
      break
    case "ArrowUp":
      changeImagePage(1);
      break
    case "ArrowDown":
      changeImagePage(-1);
      break
    case "ArrowRight":
      toggleCodeWindow();
      break
    // case 27:
    //   setEditMode('HOME');
    //   break
  }
}
