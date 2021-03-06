// "REQUIRERS"
const CFonts = require('cfonts');
const center = require('center-align');
const chalk = require('chalk');
const inquirer = require('inquirer');
const puppeteer = require('puppeteer');
const { companyQuestionsCreator } = require('./companyQuestionsCreator');
const {topicWiseQuestion} = require('./topicWiseQuestion');
const {threeInOne} = require('./threeInOne')
const {top100LikedQuestions,top100CuratedAlgo,top100InterviewQuestions} = require('./leetCodeFunctions')


    questionsFinderMenu();
    function questionsFinderMenu(){

        // Printing Intro _ Welcome to Questions Finder

        CFonts.say("WELCOME TO|QUESTIONS FINDER", {
            font: 'tiny',                 // define the font face
            align: 'center',              // define text alignment
            colors: ['yellowBright'], // define all colors
            background: 'transparent',  // define the background color, you can also use `backgroundColor` here as key
            letterSpacing: 1,           // define letter spacing
            lineHeight: 1,              // define the line height
            space: true,                // define if the output text should have empty lines on top and on the bottom
            maxLength: '0',             // define how many character can be on one line
            gradient: false,            // define your two gradient colors
            independentGradient: false, // define if you want to recalculate the gradient for each new line
            transitionGradient: false,  // define if this is a transition between colors directly
            env: 'node'                 // define the environment CFonts is being executed in
        });

        console.log(center((chalk.bgYellowBright.bold.black("The art is at your fingertips!!")),143));

        inquirer.prompt([
            {
                type:"list",
                name:"lType",
                message:chalk.bold(`Select Any ${chalk.red('ONE')}`),
                choices:["Company Related Question's GFG",
                "Topic Wise Question's GFG",
                "Company - Topic - Level (3 in 'ONE') GFG",
                "LeetCode Top 100 Liked Questions",
                "LeetCode Top 100 Curated Algo",
                "LeetCode Top 100 Interview Questions",
                "Exit"],
            }
        ]).then((answer)=>{

            let userSelectedAnswer = answer.lType;
            if(userSelectedAnswer=="Company Related Question's GFG"){
                companyQuestionsCreator();//FullyDone_with_loadingPart
                
            }
            else if(userSelectedAnswer=="Topic Wise Question's GFG"){
                  topicWiseQuestion();//fullyDone_with_loadingPart
            }
            else if(userSelectedAnswer=="Company - Topic - Level (3 in 'ONE') GFG"){
                threeInOne();//fullyDone_with_loadingPart
                
            }
            else if(userSelectedAnswer=="LeetCode Top 100 Liked Questions"){
                top100LikedQuestions();//fullyDone_with_loadingPart
            }
            else if(userSelectedAnswer=="LeetCode Top 100 Curated Algo"){
                top100CuratedAlgo();//fullyDone_with_loadingPart
            }
            else if(userSelectedAnswer=="LeetCode Top 100 Interview Questions"){
                top100InterviewQuestions();//fullyDone_with_loadingPart
            }
            else if(userSelectedAnswer=="Exit"){process.exit(0);}
            
        });
       

    }
