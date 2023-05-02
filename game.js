const inputLetter = document.querySelectorAll('.input-letter');
const spinner = document.querySelector('.spinner');
const correctAns = document.querySelector('.correct-ans');
const ANS_LENGTH = 5;

async function getWord(){
    const response = await fetch("https://words.dev-apis.com/word-of-the-day?random=1");
    const data = await response.json();
    return data;
}

function isLetter(letter){
    return /^[a-zA-Z]$/.test(letter);;
}

function hideSpinner(force){
    spinner.classList.toggle('hide', force);
}

async function init(){
    var currWord = "";
    var letterIdx = -1;
    var done = false;
    var isLoading = false;

    var data = await getWord();
    var correctWord = data.word.toUpperCase();
    var correctWordArr = correctWord.split('');

    hideSpinner(true);

    function handleLetters(letter){
        if(letterIdx>=inputLetter.length){
            return;
        }

        if(currWord.length<ANS_LENGTH){
            currWord += letter;
            if(letterIdx<inputLetter.length-1){
                inputLetter[++letterIdx].innerHTML = letter;
            }else{
                letterIdx++;
            }
        }else{
            currWord = currWord.substring(0,ANS_LENGTH-1) + letter;
            inputLetter[letterIdx].innerHTML = letter;
        }
    }

    async function isValidWord(currWord){
        const res = await fetch("https://words.dev-apis.com/validate-word", {
            method: "POST",
            body: JSON.stringify({word: currWord}),
        });
        const data = await res.json();
        return data.validWord;
    }

    function removeInvalidClass(){
        for(var i=0;i<inputLetter.length;i++){
            inputLetter[i].classList.remove('invalid');
        }
    }

    function markInvalidWord(){
        for(var i=0;i<currWord.length;i++){
            inputLetter[letterIdx-(ANS_LENGTH-i-1)].classList.add('invalid');
            setTimeout(removeInvalidClass, 1000);
        }
    }
    
    async function handleEnter(){
        if(currWord.length<ANS_LENGTH){
            return;
        }

        hideSpinner(false);
        var isValid = await isValidWord(currWord);
        hideSpinner(true);

        if(isValid){
            // create map of correct word
            var correctWordMap = {};
            for(var i=0;i<correctWord.length;i++){
                if(correctWordMap[correctWord[i]]==undefined){
                    correctWordMap[correctWord[i]] = 1;
                }else{
                    correctWordMap[correctWord[i]] += 1;
                }
            }

            // Check if correct letter
            for(var i=0;i<currWord.length;i++){
                if(currWord[i]==correctWord[i]){
                    inputLetter[letterIdx-(ANS_LENGTH-i-1)].classList.add('right');
                    correctWordMap[currWord[i]] -= 1;
                }
            }

            // Check if close and wrong letter
            for(var i=0;i<currWord.length;i++){
                if(currWord[i]==correctWord[i]){
                    continue;
                }else if(correctWordArr.includes(currWord[i]) && correctWordMap[currWord[i]]>0){
                    inputLetter[letterIdx-(ANS_LENGTH-i-1)].classList.add('close');
                    correctWordMap[currWord[i]] -= 1;
                }else{
                    inputLetter[letterIdx-(ANS_LENGTH-i-1)].classList.add('wrong');
                }
            }
            
            // check if win
            if(currWord===correctWord){
                var title = document.querySelector('.title');
                title.innerHTML = "You Win!"
                title.classList.add('winner');
                done = true;
            }else if(letterIdx==inputLetter.length-1){
                var title = document.querySelector('.title');
                title.innerHTML = `You Lose!`;
                title.classList.add('loss');
                correctAns.innerHTML = `Correct Answer: ${correctWord}`;
                done = true;
            }
            
            currWord = "";
        }else{
            markInvalidWord();
        }

    }
    
    function handleBackspace(){
        if(letterIdx==-1 || currWord.length==0 || letterIdx>=inputLetter.length){
            return;
        }
        
        currWord = currWord.substring(0,currWord.length-1);
        inputLetter[letterIdx--].innerHTML = "";
    }
    
    async function keydownHandler(event){
        var key = event.key;
        if(done || isLoading) return;
    
        if(isLetter(key)){
            handleLetters(key.toUpperCase());
        }else if(key=='Enter'){
            isLoading = true;
            await handleEnter();
            isLoading = false;
        }else if(key=='Backspace'){
            handleBackspace();
        }else{
            console.log('Wrong key');
        }
    }

    document.addEventListener('keydown', keydownHandler);
}

init();