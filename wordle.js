// declaring the constants for the program
const loadingDiv = document.querySelector(".info-bar")
const letterArray = document.querySelectorAll(".letter-box")
const ANSWER_LENGTH = 5
const ROUNDS = 6
const WORD_URL = "https://words.dev-apis.com/word-of-the-day"
const RANDOM_WORD_URL = "https://words.dev-apis.com/word-of-the-day?random=1"
const VALIDATE_WORD_URL = "https://words.dev-apis.com/validate-word"

// the init function which starts the whole program
async function init() {
    // declaring the start button on the introduction popup
    const startButton = document.querySelector(".start-btn")
    startButton.addEventListener("click", startClick)

    let guessedWord = ''
    let currentRow = 0
    let done = false
    // setting a loading state
    let isLoading = true
    setLoading(isLoading)

    // getting the word
    const response = await fetch(WORD_URL)
    const wordObject = await response.json()
    const correctWord = wordObject.word

    // changing the loading state after the word is fetched from the api
    isLoading = false
    setLoading(isLoading)

    // function that checks and validates the commited answer after pressing enter
    async function commitAnswer() {
        if (guessedWord.length < ANSWER_LENGTH) {
            // do nothing
            return
        }

        // validate the committed word
        isLoading = true
        setLoading(isLoading)

        // using a POST-request to validate the guessed word
        const res = await fetch(VALIDATE_WORD_URL, {
            method: "POST",
            body: JSON.stringify({word: guessedWord})
        })
        const wordObject = await res.json()
        const valid = wordObject.validWord 

        isLoading = false 
        setLoading(isLoading)

        // if the word is not valid the answer letters are marked as not-valid
        if (!valid) {
            for (let i = 0; i < guessedWord.length; i++) {
                letterArray[currentRow * ANSWER_LENGTH + i].classList.remove("not-valid")

                setTimeout(function() {
                    letterArray[currentRow * ANSWER_LENGTH + i].classList.add("not-valid")
                }, 100)
            }
        } else {
            // calling the helper function makeWordMap, to create a map of the guessed word
            // to have controll over the number of similar letters
            let wordMap = makeWordMap(guessedWord)

            // checking and marking all correct letters
            for (let i = 0 ; i < guessedWord.length; i++) {
                if (guessedWord[i] === correctWord[i]) {
                    letterArray[currentRow * ANSWER_LENGTH + i].classList.add("all-correct")
                    wordMap[guessedWord[i]]--
                }
            }

            // checking and marking correct and wrong letters
            for (let i = 0 ; i < guessedWord.length; i++) {
                if (guessedWord[i] === correctWord[i]) {
                    // do nothing
                } else if (correctWord.includes(guessedWord[i]) && wordMap[guessedWord[i]] > 0) {
                    letterArray[currentRow * ANSWER_LENGTH + i].classList.add("correct-letter")
                    wordMap[guessedWord[i]]--
                } else {
                    letterArray[currentRow * ANSWER_LENGTH + i].classList.add("wrong")
                }

            }

            // jumping to the next row
            currentRow++

            // checking if the guessed word is correct
            if (guessedWord === correctWord) {
                document.querySelector(".winning").style.display = "block"
                document.querySelector(".header").classList.add("celebration")
                done = true
            } 
            
            // if the answer is delivered on last line and it's not correct, 
            // the player has lost
            if (currentRow === ROUNDS) {
                document.querySelector(".lost").style.display = "block"
                document.querySelector(".correct-word").innerText = correctWord
                done = true
            }

            // if the game continues, the guessed word is blank
            guessedWord = ''
        }
    }
    
    // function to add a letter to the guessed word
    function addLetter(letter) {
        if (guessedWord.length < ANSWER_LENGTH) {
            guessedWord += letter
            letterArray[currentRow * ANSWER_LENGTH + guessedWord.length - 1].innerText = letter
        }
        
    }

    // function to handle the pressing of backspace
    function backspace() {
        guessedWord = guessedWord.slice(0, guessedWord.length - 1)
        letterArray[currentRow * ANSWER_LENGTH + guessedWord.length].innerText = ''
    }
    
    // adding a event listener to the page, to get the entered key press
    document.addEventListener("keyup", (event) =>  {
        if (done || isLoading) {
            // do nothing
            return
        }
        
        let target = event.key

        // checking which key is pressed, and perform the suitable action
        if (target === "Enter") {
            commitAnswer()
        } else if (target === "Backspace") {
            backspace()
        } else {
            if (isLetter(target)) {
                addLetter(target)
            }
        }
    })
        
}


// function to remove the intro popup and start the game
function startClick(){
    document.querySelector(".pop-up").style.display = "none"
}

// function to test wether the user is typing a single letter, copied
// from Frontend Masters
function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter)
}


// function that's create a map of letters in the word
function makeWordMap(word) {
    let map = {}
    for (let i = 0; i < word.length; i++) {
        if (map[word[i]]) {
            map[word[i]]++
        } else {
            map[word[i]] = 1
        }
    }
    return map
}

// functions that close the result popup
function closeWinningPopup() {
    document.querySelector(".winning").style.display = "none"
}

function closeLosingPopup() {
    document.querySelector(".lost").style.display = "none"
}

// function to keep track of the loading state
function setLoading(isLoading) {
    if (isLoading) {
        loadingDiv.style.display = "block"
    } else if (!isLoading) {
        loadingDiv.style.display = "none"
    }
}

init()

