const inputLetter = document.querySelectorAll('.input-letter');
const spinner = document.querySelector('.spinner');
const correctAns = document.querySelector('.correct-ans');
const ANS_LENGTH = 5;

/**
 * The function retrieves a random word of the day from an API.
 * @returns The function `getWord()` is returning a Promise that resolves to the JSON data fetched from
 * the API endpoint "https://words.dev-apis.com/word-of-the-day?random=1". The JSON data likely
 * contains information about the word of the day, such as its definition, pronunciation, and usage
 * examples.
 */
async function getWord(){
    const response = await fetch("https://words.dev-apis.com/word-of-the-day?random=1");
    const data = await response.json();
    return data;
}

/**
 * The function checks if a given character is a letter (either uppercase or lowercase) using a regular
 * expression.
 * @param letter - a string representing a single letter that needs to be checked if it is a letter of
 * the English alphabet.
 * @returns The function `isLetter` returns a boolean value indicating whether the input `letter` is a
 * single letter of the English alphabet (either uppercase or lowercase).
 */
function isLetter(letter){
    return /^[a-zA-Z]$/.test(letter);;
}

/**
 * The function hides a spinner element by toggling its 'hide' class based on a boolean parameter.
 * @param force - The "force" parameter is a boolean value that determines whether the spinner should
 * be forcefully hidden or not. If it is set to true, the spinner will be hidden regardless of its
 * current state. If it is set to false or not provided, the spinner will toggle its visibility based
 * on its current state
 */
function hideSpinner(force){
    spinner.classList.toggle('hide', force);
}

/**
 * The function handles user input for a word guessing game, checks if the input is valid, updates the
 * display accordingly, and determines if the game is won or lost.
 */
async function init(){
    var currWord = "";
    var letterIdx = -1;
    var done = false;
    var isLoading = false;

    var data = await getWord();
    var correctWord = data.word.toUpperCase();
    var correctWordArr = correctWord.split('');

    hideSpinner(true);

    /**
     * The function handles input letters for a word game.
     * @param letter - The letter parameter is a string representing the letter that needs to be
     * handled by the function.
     * @returns If the condition `if(letterIdx>=inputLetter.length)` is true, then nothing is returned.
     * Otherwise, the function does not have a return statement and will implicitly return `undefined`.
     */
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

    /**
     * The function checks if a given word is valid using an external API.
     * @param currWord - currWord is a string parameter representing the word that needs to be
     * validated. The function uses the fetch API to send a POST request to the
     * "https://words.dev-apis.com/validate-word" endpoint with the currWord as the request body. The
     * response is then parsed as JSON and the function
     * @returns a boolean value indicating whether the input `currWord` is a valid word or not.
     */
    async function isValidWord(currWord){
        const res = await fetch("https://words.dev-apis.com/validate-word", {
            method: "POST",
            body: JSON.stringify({word: currWord}),
        });
        const data = await res.json();
        return data.validWord;
    }

    /**
     * The function removes the 'invalid' class from all elements.
     */
    function removeInvalidClass(){
        for(var i=0;i<inputLetter.length;i++){
            inputLetter[i].classList.remove('invalid');
        }
    }

    /**
     * The function marks invalid letters in a word and removes the invalid class after a set time.
     */
    function markInvalidWord(){
        for(var i=0;i<currWord.length;i++){
            inputLetter[letterIdx-(ANS_LENGTH-i-1)].classList.add('invalid');
            setTimeout(removeInvalidClass, 1000);
        }
    }
    
    /**
     * The function handles user input for a word guessing game and checks if the input is valid,
     * updates the display accordingly, and determines if the game is won or lost.
     * @returns nothing (undefined).
     */
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
    
    /**
     * The function handles the backspace key by removing the last character from the current word and
     * updating the corresponding HTML element.
     * @returns nothing (undefined) if the conditions in the if statement are met. If the conditions
     * are not met, the function executes the code inside the if statement and does not explicitly
     * return anything.
     */
    function handleBackspace(){
        if(letterIdx==-1 || currWord.length==0 || letterIdx>=inputLetter.length){
            return;
        }
        
        currWord = currWord.substring(0,currWord.length-1);
        inputLetter[letterIdx--].innerHTML = "";
    }
    
    /**
     * The function handles keydown events and performs different actions based on the pressed key.
     * @param event - The event parameter is an object that contains information about the event that
     * triggered the function. In this case, it is likely a keyboard event, such as a key press or
     * release. The function uses the information in the event object to determine which key was
     * pressed and how to handle it.
     * @returns The function `keydownHandler` is not returning anything. It is an event handler
     * function that is triggered when a key is pressed.
     */
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