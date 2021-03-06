//Requires..
const fs = require('fs');
const CFonts = require('cfonts');
const center = require('center-align');
const chalk = require('chalk');
const puppeteer = require('puppeteer');
const inquirer = require('inquirer');
const PDFDocument = require('pdfkit');
const doc = require('pdfkit');
const { list } = require('pdfkit');
var fuzzy = require('fuzzy');
const ora = require('ora');
const spinner = ora();


inquirer.registerPrompt('checkbox-plus', require('inquirer-checkbox-plus-prompt'));
exports.companyQuestionsCreator = (async ()=>{
    try{
    var browser = await puppeteer.launch({
        headless:false,
        defaultViewport: null,
        args: ["--start-maximized"],
        slowMo : 120,
    });
    let pagesArr = await browser.pages();
    var gPage=pagesArr[0];
    spinner.spinner = "arc"
	spinner.color = 'yellow';
    spinner.text = 'Loading... GFG Company Names';
    spinner.start();
    await gPage.goto("https://practice.geeksforgeeks.org/company-tags/");
    await gPage.waitForSelector(".well.table.whiteBgColor .text-center a b");
    var allCompanyNameArr = await gPage.evaluate(()=>{

        let allCompanyName = document.querySelectorAll(
        ".well.table.whiteBgColor .text-center a b"
        );
        let allCompanyNameArr =[];
        for(let i=0;i<allCompanyName.length;i++){
            allCompanyNameArr[i] = allCompanyName[i].innerText;
        }
        return allCompanyNameArr;
    });
    spinner.stop().clear();
    await userSelectedCompanyName();
     async function userSelectedCompanyName(){
        await inquirer.prompt([
            {
                type: 'checkbox-plus',
                name: 'cbType',
                message: chalk.bold(`Select ${chalk.bold.red('Any Company')} - You Can Also Select ${chalk.red.bold('Multiple')} Company`),
                pageSize: 10,
                highlight: true,
                searchable: true,    
                source: function(answersSoFar, input) {
                  input = input || '';
                  return new Promise(function(resolve) {              
                    var fuzzyResult = fuzzy.filter(input, allCompanyNameArr);       
                    var data = fuzzyResult.map(function(element) {
                      return element.original;
                    });            
                    resolve(data);           
                  });  
                }
            }
        ]).then( (answers)=>{

            var selectedCompanyArr = answers.cbType;
            //User selected Nothing
            if(selectedCompanyArr.length==0){
                  inquirer.prompt([
                    {
                        type:"list",
                        name:"lType",
                        message:chalk.bold(`${chalk.yellow('OOPS!! Selected Nothing')} Select Any ${chalk.bold.red('ONE')}`),
                        choices:["Select Company Again","Exit"],
                    }
                ]).then((answers)=>{
                    let userSelectedAnswer = answers.lType;
                    if(userSelectedAnswer=="Select Company Again"){ userSelectedCompanyName();}
                    else if(userSelectedAnswer=="Exit"){process.exit(0);}
                });
            }else{
                
                 companyLevel();
                 function companyLevel(){

                         inquirer.prompt([
                        {
                            type:"list",
                            name:"lType",
                            message:chalk.bold(`Select Any ${chalk.bold.red('ONE')}`),
                            choices:["Select Different LEVEL for Each Company","EASY LEVEL Question For All Selected Company","MEDIUM LEVEL Question For All Selected Company","HARD LEVEL for Question For All Selected Company","Other Option","Exit"],
                        }
                    ]).then((answer)=>{

                        let userSelectedAnswer = answer.lType;
                        var selectedLevel;
                        
                        if(userSelectedAnswer=="Select Different LEVEL for Each Company"){
                            createCompanyQuestions(selectedCompanyArr,selectedLevel);
                        }
                        else if(userSelectedAnswer=="EASY LEVEL Question For All Selected Company" || userSelectedAnswer=="MEDIUM LEVEL Question For All Selected Company" || userSelectedAnswer =="HARD LEVEL for Question For All Selected Company" ){
                            
                            if(userSelectedAnswer.includes("EASY")){selectedLevel = "Easy"}
                            else if(userSelectedAnswer.includes("MEDIUM")){selectedLevel = "Medium"}
                            else if(userSelectedAnswer.includes("HARD")){selectedLevel = "Hard"}
                            createCompanyQuestions(selectedCompanyArr,selectedLevel);

                        }
                        else if(userSelectedAnswer=="Other Option"){

                            inquirer.prompt([
                                {
                                type:"list",
                                name:"lType",
                                message:chalk.bold(`Select Any ${chalk.red('One')}`),
                                choices:["Cancel This Option","Go Back","Exit"],
                                    
                                }
                                ]).then((answer)=>{
                                    let userSelectedAnswer = answer.lType;
                                    if(userSelectedAnswer=="Cancel This Option"){ companyLevel();}
                                    else if(userSelectedAnswer=="Go Back"){ userSelectedCompanyName();}
                                    else if(userSelectedAnswer=="Exit"){process.exit(0);}
                                });
                        }

                    });
                }
            }

            async function createCompanyQuestions(selectedCompanyArr,selectedLevel){
                //var gPage=gPage;
                var selectedLevelArr=[];
                for(i=0;i<selectedCompanyArr.length;i++){

                   var singleCompany = selectedCompanyArr[i];
                    if(selectedLevel==undefined){
                        /* This Function Handle -> Level Loop for Each different company
                         await is waiting for another await function*/
                       await decideLevel();
                       async function decideLevel(){
                            await  inquirer.prompt([
                                {
                                    type:"checkbox",
                                    name:"cbType",
                                    message:chalk.bold(`For ${chalk.red(singleCompany)} -  You Can Also Select ${chalk.red("Multiple")}'LEVEL'`),
                                    choices:["Easy","Medium","Hard"],
                                }
                            ]).then(async (ans)=>{
                                selectedLevelArr = ans.cbType;
                                if(selectedLevelArr.length==0){ 
                                    await  decideLevel();
                                }
                            });
                       }                     
                  }else if(selectedLevel!=undefined){
                      selectedLevelArr[0]=selectedLevel;
                  }
                  for(let j=0;j<selectedLevelArr.length;j++){
                      var singleLevel = selectedLevelArr[j];
                      spinner.text = `Creating... GFG ${singleCompany} : ${singleLevel} Questions Pdf`;
                      spinner.start();

                    await gPage.goto("https://practice.geeksforgeeks.org/company/"+singleCompany+"/");
                    await gPage.waitForSelector(".panel-title")
                    await gPage.click(".panel-group .panel [href='#collapse1']")


                    if(singleLevel == "Easy"){ 
                        await gPage.waitForSelector("[name='difficulty[]'][value='0']");
                        await  gPage.click("[name='difficulty[]'][value='0']");
                    }
                    else if(singleLevel == "Medium"){
                        await gPage.waitForSelector("[name='difficulty[]'][value='1']");
                        await gPage.click("[name='difficulty[]'][value='1']");
                    }
                    else if(singleLevel == "Hard"){
                        await gPage.waitForSelector("[name='difficulty[]'][value='2']");
                        await gPage.click("[name='difficulty[]'][value='2']");
                    }
                    await gPage.waitForTimeout(600);
                    await scrollToBottom();

                    let companyQuestionLinkObj = await gPage.evaluate(()=>{
                        
                        let allCpyQues = document.querySelectorAll(
                                ".panel.problem-block div>span"
                        );
                        let allCpyQuesLink = document.querySelectorAll('a[style="position: absolute;top: 0;left: 0;height: 100%;width: 100%;z-index:1;pointer:cursor;"]');

                        let allCompanyQuestionArr=[];
                        let allCompanyQuestionLinkArr=[];
                        // cant Do Direct Because its not ARR its Type of Arr :-
                        for(let i=0;i<allCpyQues.length;i++){
                            allCompanyQuestionArr[i] = allCpyQues[i].innerHTML;
                            allCompanyQuestionLinkArr[i] = allCpyQuesLink[i].getAttribute('href');
                        }
                        return {allCompanyQuestionArr,allCompanyQuestionLinkArr};

                    });
                    let companyQuestionArr = companyQuestionLinkObj.allCompanyQuestionArr;
                    let companyQuestionLinkArr = companyQuestionLinkObj.allCompanyQuestionLinkArr
                   

                        if(companyQuestionArr.length!=0){
                            await folderCheck(singleLevel,companyQuestionArr,singleCompany,companyQuestionLinkArr);
                            spinner.succeed(chalk.bold.yellow(`Congratulations QuestionsPDF And Link For : ${singleCompany} : ${singleLevel} Level has been Created` ));
         
                        }else{
                            spinner.warn(chalk.bold.yellow(`GFG HAS ${chalk.red('NULL')} Questions For : ${singleCompany} :${singleLevel} : Questions`));
                        }
                    }
                }

                console.log(center((chalk.bgRedBright.bold.black("\n Thank You For Using questionsFinder ")),122));
            }
            //Require For PDF CREATE

            //---------------------------//

            function folderCheck(singleLevel,companyQuestionArr,singleCompany,companyQuestionLinkArr){
                let folderPath = "./questionsFinder_Downloads/companyRelatedQuestions/"+singleCompany+"_Questions"
                if (fs.existsSync(folderPath)) {
                    pdfCreate(folderPath,singleLevel,companyQuestionArr,singleCompany,companyQuestionLinkArr);
                }else {
                    fs.mkdirSync(folderPath,{ recursive: true });
                    pdfCreate(folderPath,singleLevel,companyQuestionArr,singleCompany,companyQuestionLinkArr);
                }
            };

            //------------------------//
            function pdfCreate(folderPath,singleLevel,companyQuestionArr,singleCompany,companyQuestionLinkArr){
                const doc = new PDFDocument;
                doc.pipe(fs.createWriteStream(folderPath+"/"+singleCompany+"_"+singleLevel+"_Questions"+'.pdf'))
                    
                    doc.font('./fonts/CascadiaCode-Bold.otf')
                        .fontSize(22)
                        .text(`${singleCompany} : Questions : ${singleLevel} : GFG`)
                    doc.moveDown();
                    doc.font('./fonts/CascadiaCode.ttf')
                        .fontSize(18)
                        for(idx in companyQuestionArr){
                            doc.text(`${Number(idx)+1}. ${companyQuestionArr[idx]}`,{
                                link:companyQuestionLinkArr[idx],
                            })
                            doc.moveDown(1.1);
                        }
                doc.end()
            }
            //-----------------------//

            async function scrollToBottom() {
                const distance = 60;
                while (await gPage.evaluate(() => document.scrollingElement.scrollTop + window.innerHeight < document.scrollingElement.scrollHeight)) {
                await gPage.evaluate((y) => { document.scrollingElement.scrollBy(0, y); }, distance);
                await gPage.waitForTimeout(500);
                }
            }

            //---------------------//
         
            
        });
    }

}catch (e) {
    spinner.fail(chalk.bold.yellow("Please Check Your Internet Connection Or 'RESTART' - questionsFinder"))
    }

})