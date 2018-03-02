'use strict';
// var $ = window.jQuery = require("jquery/src/core");

import HashTable from './hashtable.js'
import './index.css';
// import './MathJax.js'


//load subjects from subjects.json

var subjects = require('./data/subjects.json');

//load exams from exams.json

var exams = require('./data/exam.json');


// reverse subjects array to reoder subjects
subjects = subjects.reverse();


// $(window).on('popstate', function(event) {
//  alert("pop");
// });



/*
create an array to store the subjects IDs
They will be used in getting the exams
*/

var subjectIDs = [];
var current_subject = 0;
// load and render  subjects
class Subjects{
    constructor(){
      this.subjects = subjects;
    }
    renderSubjects(){
      $.each(subjects, function(i, subject){
        this.subjectName = subject.name;
        this.subjectId = subject.id;
        $('#ID-main-section').append(`
          <div class="btn btn-primary btn-lg subject-btn"
          id="subject-${this.subjectId}">
          ${this.subjectName}</div>
          <br />
          `);
          //create subject keys
          subjectIDs.push(this.subjectId);

      });
    }
};

var subject_obj = new Subjects();

subject_obj.renderSubjects();

/*
Load exams based the clicked subject
*/

class Exams{
  constructor(){
    var self = this;
    $.each(subjectIDs, function(i, id){
      $('#subject-'+id).on('click', function(){
        self.getExams(id);
      });

    });
  }


  getExams(theSubjectID){

    this.subjectID = theSubjectID;

    var self = this;

    for(var i=0; i<subjects.length; i++){
      if(exams[i].id == this.subjectID){
        $('#ID-main-section').empty();
        $('#ID-lead-instruction').html('Choose an exam');

      // current subject on navigation tabs
        $.each(subjects, function(i, subject){
          if(subject.id == self.subjectID){
            $('#ID-named-subject-tab').html(
                `
                <span class='btn btn-lg subject-name-btn'>
                    ${subject.name}
                </span>
                `
            );
            current_subject = subject.id;
            //location.hash = subject.name;
            // history.pushState({id: subject.id}, '', subject.name);
          }
        });

      var examsInsubject = exams[i].exams.reverse();
      // exams for the selected subject
       $.each(examsInsubject, function(i, exam){
         this.examName = exam.name;
         this.examId = exam.id;
         var self = this;
         $('#ID-main-section').append(`
           <div class="btn btn-primary btn-lg exam-btn"
           id="exam-${this.examId}">
           ${this.examName}</div>
           <br>
           `);

           // get questions in exam
           $('#exam-'+this.examId).on('click', function(){
             var questionsDisplaySection = `
             <div class="row">
               <div class="col-sm-2"></div>
               <div class="col-sm-8 questionsTemplate">
               <br>
               <div class="questionHeader" id="ID-question-header">
                Question: &nbsp;&nbsp;
                <span id="ID-question-number"></span>
                of
                <span id="ID-question-end"></span>

               </div>
               <p>&nbsp;</p>
                <div class="questionDetails" id="ID-questionDetails">
                  <div class="questionStatement" id="ID-question-statement">

                  </div>

                  <div id="ID-question-resource"></div>
                  <br>
                  <div class="questionChoice" id="ID-choice-A"></div>
                  <div class="questionChoice" id="ID-choice-B"></div>
                  <div class="questionChoice" id="ID-choice-C"></div>
                  <div class="questionChoice" id="ID-choice-D"></div>
                </div>

                <div class="row" id="ID-navigation-buttons">
                  <div class="col-sm-4 col-xs-4">
                    <img src="./assets/images/back.png" id="ID-back-btn"
                    class="img questionNavBtn"/>
                  </div>
                  <div class="col-sm-4 col-xs-4"></div>
                  <div class="col-sm-4 col-xs-4">
                    <img src="./assets/images/next.png" id="ID-next-btn"
                    class="img questionNavBtn"/>
                  </div>
                </div>

               </div>
               <div class="col-sm-2"></div>
             </div>
             `;


             $('#ID-timer').timer();

             var questionsInExam = examsInsubject[i].questions;
             questionsInExam.sort(function(a, b) {
                  return a.question_number - b.question_number;

              });
             var textResourcesInExam = examsInsubject[i].text_resources;
             var hashtableQuestions = new HashTable();
             var hashtableChoices = new HashTable();
             var hashtableTextResources = new HashTable();
             var hashtableTextResourcesInQuestions = new HashTable();
             var hashTableImageResources = new HashTable();
             var hashtableChoiceImages = new HashTable();
             var hashtableChoiceIsCorrect = new HashTable();
             var hashTableSelectChoiceColor = new HashTable();
             $('#ID-lead-instruction').html(self.examName);
             $('#ID-main-section').html(questionsDisplaySection);
             $('#ID-question-end').html(questionsInExam[(questionsInExam.length)-1].question_number);

             // get text resources
             $.each(textResourcesInExam, function(i, textResource){
               hashtableTextResources.insert(textResource.id, textResource.statement)
             });

             var counter = 1;
             if (examsInsubject[i].subject == 5 || examsInsubject[i].subject == 22 || examsInsubject[i].subject == 23){
               counter = 61;
             }
             $('#ID-question-number').html(counter);

             $.each(questionsInExam, function(i, question){
               hashTableImageResources.insert(question.question_number, question.image_resources);
                hashtableQuestions.insert(question.question_number, question.statement);
                hashtableChoices.insert(question.question_number, question.choices);
                hashtableTextResourcesInQuestions.insert(question.question_number, question.text_resource);
              });

              function getQuestionStatment(theCounter){
                var originalStatement = hashtableQuestions.retrieve(counter);
                var matchResource = originalStatement.match(/\[resource\:\s\d+,\s\align\:\s\left\]/);
                var stripedStatement = originalStatement.replace(matchResource, '');
                $('#ID-question-statement').html(stripedStatement);              }

              getQuestionStatment(counter);

              function getImageResource(theCounter){
                var imageResourceInQuestion = hashTableImageResources.retrieve(theCounter);
                var questionStatement = hashtableQuestions.retrieve(theCounter);

                if (imageResourceInQuestion.length != 0){
                  $('#ID-question-resource').html(`
                    <img class='img imageResource' src='.${imageResourceInQuestion[0].avatar.substring(47)}' />
                    `);
                }else{
                  $('#ID-question-resource').html('');
                }
              }

              getImageResource(counter);

              var textResourceInQuestion = '';

              var openTextInTextResource = '';

              function getTextResource(){
                if(hashtableTextResourcesInQuestions.retrieve(counter) != null){
                  $('#ID-question-statement').html(hashtableTextResources.retrieve(hashtableTextResourcesInQuestions.retrieve(counter)));
                  textResourceInQuestion = $('#ID-question-statement').html();
                  openTextInTextResource = textResourceInQuestion.match(/_+?\d+_+/);
                }
              }
              getTextResource();
              function getChoices(theCounter){
                var allChoices = hashtableChoices.retrieve(counter);
                //get images for choices
                var choiceImageA, choiceImageB, choiceImageC, choiceImageD;
                if (allChoices.choices_image.length != 0){
                choiceImageA  = allChoices.choices_image[0].image_url.substring(47);
                choiceImageB  = allChoices.choices_image[1].image_url.substring(47);
                choiceImageC  = allChoices.choices_image[2].image_url.substring(47);
                choiceImageD  = allChoices.choices_image[3].image_url.substring(47);
                }


                var choiceA = allChoices["A"];
                var matchResourceA = choiceA.match(/\[resource\:\s\d+,\s\align\:\s\left\]/);
                var stripedStatementA = choiceA.replace(matchResourceA, '');
                matchResourceA === null  ? $('#ID-choice-A').html(choiceA): $('#ID-choice-A').html(`
                    <img class="img" src='.${choiceImageA}' />
                  `) ;

                var choiceB = allChoices["B"];
                var matchResourceB = choiceB.match(/\[resource\:\s\d+,\s\align\:\s\left\]/);
                var stripedStatementB = choiceB.replace(matchResourceB, '');
                matchResourceB === null  ? $('#ID-choice-B').html(choiceB): $('#ID-choice-B').html(`
                  <img class="img" src='.${choiceImageB}' />`) ;

                var choiceC = allChoices["C"];
                var matchResourceC = choiceC.match(/\[resource\:\s\d+,\s\align\:\s\left\]/);
                var stripedStatementC = choiceC.replace(matchResourceC, '');
                matchResourceC === null  ? $('#ID-choice-C').html(choiceC): $('#ID-choice-C').html(`
                  <img class="img" src='.${choiceImageC}' />`) ;

                var choiceD = allChoices["D"];
                var matchResourceD = choiceD.match(/\[resource\:\s\d+,\s\align\:\s\left\]/);
                var stripedStatementD = choiceD.replace(matchResourceD, '');
                matchResourceD === null  ? $('#ID-choice-D').html(choiceD): $('#ID-choice-D').html(`
                  <img class="img" src='.${choiceImageD}' />`) ;
              }
              getChoices(counter);

              // answering question
              var hashtableChoicesText = new HashTable();
              var resourceCounter = 1;
              function answerQuestion(){
                var choiceIsCorrect;
                var textChoice = '';
                $('#ID-choice-A').on('click', function(){

                    hashTableSelectChoiceColor.insert(counter, "ID-choice-A");
                    $('#ID-choice-B').css('background-color', '#436bb3');
                    $('#ID-choice-C').css('background-color', '#436bb3');
                    $('#ID-choice-A').css('background-color', '#6bc8c4');
                    $('#ID-choice-D').css('background-color', '#436bb3');


                  if(hashtableChoices.retrieve(counter).answer == this.id.substring(10)){
                      choiceIsCorrect = 1;
                      hashtableChoiceIsCorrect.insert(counter, choiceIsCorrect);
                  }else{
                    choiceIsCorrect = 0;
                    hashtableChoiceIsCorrect.insert(counter, choiceIsCorrect);
                  }
                  if(hashtableTextResourcesInQuestions.retrieve(counter) != null){
                    hashtableChoicesText.insert(resourceCounter, $(this).text());
                    textResourceInQuestion = textResourceInQuestion.replace(openTextInTextResource, hashtableChoicesText.retrieve(resourceCounter));
                    hashtableTextResources.insert(hashtableTextResourcesInQuestions.retrieve(counter), textResourceInQuestion);
                    openTextInTextResource = $(this).text();
                    $('#ID-question-statement').html(hashtableTextResources.retrieve(hashtableTextResourcesInQuestions.retrieve(counter)));
                  }


                });
                $('#ID-choice-B').on('click', function(){

                hashTableSelectChoiceColor.insert(counter, "ID-choice-B");

                $('#ID-choice-B').css('background-color', '#6bc8c4');
                $('#ID-choice-C').css('background-color', '#436bb3');
                $('#ID-choice-A').css('background-color', '#436bb3');
                $('#ID-choice-D').css('background-color', '#436bb3');


                  if(hashtableChoices.retrieve(counter).answer == this.id.substring(10)){
                      choiceIsCorrect = 1;
                      hashtableChoiceIsCorrect.insert(counter, choiceIsCorrect);
                  }else{
                    choiceIsCorrect = 0;
                    hashtableChoiceIsCorrect.insert(counter, choiceIsCorrect);
                  }
                  if(hashtableTextResourcesInQuestions.retrieve(counter) != null){
                    textChoice = $(this).text();
                    textResourceInQuestion = textResourceInQuestion.replace(openTextInTextResource, textChoice);
                    hashtableTextResources.insert(hashtableTextResourcesInQuestions.retrieve(counter), textResourceInQuestion);
                    openTextInTextResource = $(this).text();
                    $('#ID-question-statement').html(hashtableTextResources.retrieve(hashtableTextResourcesInQuestions.retrieve(counter)));
                  }

                });
                $('#ID-choice-C').on('click', function(){
                    hashTableSelectChoiceColor.insert(counter, "ID-choice-C");

                    $('#ID-choice-C').css('background-color', '#6bc8c4');
                    $('#ID-choice-A').css('background-color', '#436bb3');
                    $('#ID-choice-B').css('background-color', '#436bb3');
                    $('#ID-choice-D').css('background-color', '#436bb3');
                  if(hashtableChoices.retrieve(counter).answer == this.id.substring(10)){
                      choiceIsCorrect = 1;
                      hashtableChoiceIsCorrect.insert(counter, choiceIsCorrect);
                  }else{
                    choiceIsCorrect = 0;
                    hashtableChoiceIsCorrect.insert(counter, choiceIsCorrect);
                  }
                  if(hashtableTextResourcesInQuestions.retrieve(counter) != null){
                    textResourceInQuestion = textResourceInQuestion.replace(openTextInTextResource, $(this).text());
                    openTextInTextResource = $(this).text();
                    hashtableTextResources.insert(hashtableTextResourcesInQuestions.retrieve(counter), textResourceInQuestion);
                    $('#ID-question-statement').html(textResourceInQuestion);
                  }

                });
                $('#ID-choice-D').on('click', function(){
                    // hashTableSelectChoiceColor.insert(counter, '#6bc8c4');
                    hashTableSelectChoiceColor.insert(counter, "ID-choice-D");
                    $('#ID-choice-C').css('background-color', '#436bb3');
                    $('#ID-choice-A').css('background-color', '#436bb3');
                    $('#ID-choice-B').css('background-color', '#436bb3');
                    $('#ID-choice-D').css('background-color', '#6bc8c4');


                  if(hashtableChoices.retrieve(counter).answer == this.id.substring(10)){
                      choiceIsCorrect = 1;
                      hashtableChoiceIsCorrect.insert(counter, choiceIsCorrect);
                  }else{
                    choiceIsCorrect = 0;
                    hashtableChoiceIsCorrect.insert(counter, choiceIsCorrect);
                  }
                  if(hashtableTextResourcesInQuestions.retrieve(counter) != null){
                    textResourceInQuestion = textResourceInQuestion.replace(openTextInTextResource, $(this).text());
                    openTextInTextResource = $(this).text();
                    hashtableTextResources.insert(hashtableTextResourcesInQuestions.retrieve(counter), textResourceInQuestion);
                    $('#ID-question-statement').html(textResourceInQuestion);
                  }

                });
              }

              answerQuestion();

              // grade the marks
              var grade = '';
              function grading(percentageMarks){
                if (percentageMarks > 79) {
                      grade = 'A';
                  } else if (percentageMarks > 74 && percentageMarks < 80) {
                      grade = 'A-';
                  } else if (percentageMarks > 69 && percentageMarks < 75) {
                      grade = 'B+';
                  } else if (percentageMarks > 64 && percentageMarks < 70) {
                      grade = 'B';
                  } else if (percentageMarks > 59 && percentageMarks < 65) {
                      grade = 'B-';
                  } else if (percentageMarks > 54 && percentageMarks < 60) {
                      grade = 'C+';
                  } else if (percentageMarks > 49 && percentageMarks < 55) {
                      grade = 'C';
                  } else if (percentageMarks > 45 && percentageMarks < 50) {
                      grade = 'C-';
                  } else if (percentageMarks > 39 && percentageMarks < 45) {
                      grade = 'D+';
                  } else if (percentageMarks > 34 && percentageMarks < 40) {
                      grade = 'D';
                  } else if (percentageMarks > 29 && percentageMarks < 35) {
                      grade = 'D-';
                  } else {
                      grade = 'E';
                  }
                  return grade;
              }

              // success messages after exam  is completed
              var successMsg = '';

              function successMessage(percentageMarks){
                if (percentageMarks > 74) {
                      successMsg = "Excellent";
                  } else if (percentageMarks > 59 && percentageMarks < 75) {
                      successMsg = "Very Good";
                  } else if (percentageMarks > 44 && percentageMarks < 60) {
                      successMsg = "Good";
                  } else if (percentageMarks > 29 && percentageMarks < 45) {
                      successMsg = "Fair";
                  } else {
                      successMsg = "Nice Try";
                  }
                  return successMsg;
              }

              //summing marks
              var questionsDone = [];
              function totalMarks(){
                var marks = 0 ;
                if(counter = questionsInExam.length){
                  for(var i=0; i<hashtableChoiceIsCorrect.retrieveAll()[0].length; i++){
                        questionsDone.push(hashtableChoiceIsCorrect.retrieveAll()[0][i][0]);

                  }
                  for(var j =0; j<questionsDone.length; j++){
                    marks += hashtableChoiceIsCorrect.retrieve(questionsDone[j]);
                  }

                  marks = Math.round((marks/questionsInExam.length)*100);

                  $('#ID-lead-instruction').html(successMessage(marks));
                  $('#ID-navigation-buttons').html('');
                  var totalMarksTemplate = `
                  <div class="circularMarks" id="ID-circular-marks">
                      ${marks}%

                      <div>${grading(marks)}</div>
                  </div>
                  `;
                  $('#ID-question-header').html('');
                  $('#ID-questionDetails').html(totalMarksTemplate);

                  //display different instructions for kiswahili
                  if (current_subject === 4){
                    $('#ID-questionDetails').append(`
                      <h2>Haukuyajibu maswali yafuatayo kisahihi</h2>
                      `);
                  }else{
                    $('#ID-questionDetails').append(`
                      <h2>You answered the following questions incorrectly</h2>
                      `);
                  }

                }
              }

              // get wrong questions
              function getWrongQuestions(){
                var textResource = '';
                for(var i=0; i<questionsDone.length; i++){
                  if(hashtableChoiceIsCorrect.retrieve(questionsDone[i])==0){

                    if(hashtableTextResourcesInQuestions.retrieve(questionsDone[i]) != null){
                      textResource = hashtableTextResources.retrieve(hashtableTextResourcesInQuestions.retrieve(questionsDone[i]));
                    }else{
                      textResource = '';
                    }

                      if (current_subject === 4){
                        $('#ID-questionDetails').append(`
                          <div class="wrong-questions">

                          <span class="question-number-feedback">${questionsDone[i]}</span>
                          ${textResource}

                           ${hashtableQuestions.retrieve(questionsDone[i])}

                          <div id="ID-choice-A" class="questionChoice">${hashtableChoices.retrieve(questionsDone[i])["A"]}</div>
                          <div id="ID-choice-B" class="questionChoice">${hashtableChoices.retrieve(questionsDone[i])["B"]}</div>
                          <div id="ID-choice-C" class="questionChoice">${hashtableChoices.retrieve(questionsDone[i])["C"]}</div>
                          <div id="ID-choice-D" class="questionChoice">${hashtableChoices.retrieve(questionsDone[i])["D"]}</div>

                          <p>Jibu sahihi: </p>
                          ${hashtableChoices.retrieve(questionsDone[i])[hashtableChoices.retrieve(questionsDone[i]).answer]}
                          </div>
                          `);
                      }else{
                        $('#ID-questionDetails').append(`
                          <div class="wrong-questions">

                          <span class="question-number-feedback">${questionsDone[i]}</span>
                          ${textResource}

                           ${hashtableQuestions.retrieve(questionsDone[i])}

                          <div id="ID-choice-A" class="questionChoice">${hashtableChoices.retrieve(questionsDone[i])["A"]}</div>
                          <div id="ID-choice-B" class="questionChoice">${hashtableChoices.retrieve(questionsDone[i])["B"]}</div>
                          <div id="ID-choice-C" class="questionChoice">${hashtableChoices.retrieve(questionsDone[i])["C"]}</div>
                          <div id="ID-choice-D" class="questionChoice">${hashtableChoices.retrieve(questionsDone[i])["D"]}</div>

                          <p>Correct answer: </p>
                          ${hashtableChoices.retrieve(questionsDone[i])[hashtableChoices.retrieve(questionsDone[i]).answer]}
                          </div>
                          `);
                      }
                  }

                }
              }

              $('#ID-next-btn').on('click', function(){
                 var next_counter = counter+1
                  if (hashTableSelectChoiceColor.retrieve(next_counter) == "ID-choice-B"){
                      $('#ID-choice-B').css('background-color', '#6bc8c4');
                      $('#ID-choice-C').css('background-color', '#436bb3');
                      $('#ID-choice-A').css('background-color', '#436bb3');
                      $('#ID-choice-D').css('background-color', '#436bb3');
                  }else if (hashTableSelectChoiceColor.retrieve(next_counter) == "ID-choice-A"){
                      $('#ID-choice-C').css('background-color', '#436bb3');
                      $('#ID-choice-A').css('background-color', '#6bc8c4');
                      $('#ID-choice-B').css('background-color', '#436bb3');
                      $('#ID-choice-D').css('background-color', '#436bb3');
                  } else if (hashTableSelectChoiceColor.retrieve(next_counter) == "ID-choice-C"){
                      $('#ID-choice-C').css('background-color', '#6bc8c4');
                      $('#ID-choice-A').css('background-color', '#436bb3');
                      $('#ID-choice-B').css('background-color', '#436bb3');
                      $('#ID-choice-D').css('background-color', '#436bb3');
                  } else if (hashTableSelectChoiceColor.retrieve(next_counter) == "ID-choice-D"){
                      $('#ID-choice-C').css('background-color', '#436bb3');
                      $('#ID-choice-A').css('background-color', '#436bb3');
                      $('#ID-choice-B').css('background-color', '#436bb3');
                      $('#ID-choice-D').css('background-color', '#6bc8c4');
                  } else {
                      $('#ID-choice-C').css('background-color', '#436bb3');
                      $('#ID-choice-A').css('background-color', '#436bb3');
                      $('#ID-choice-B').css('background-color', '#436bb3');
                      $('#ID-choice-D').css('background-color', '#436bb3');
                  }

                counter += 1;
                if(counter < questionsInExam[(questionsInExam.length)-1].question_number+1){
                  getQuestionStatment(counter);
                  $('#ID-question-number').html(counter);
                  getChoices(counter);
                  getTextResource();
                  getImageResource(counter);

                }else{
                  totalMarks();
                  if(questionsDone.length !=0){
                    getWrongQuestions();
                  }
                }
                MathJax.Hub.Queue(["Typeset",MathJax.Hub,jQuery.find(".math-tex")]);

              });
              // hide back button if only back button displayed
              $('#ID-back-btn').on('click', function(){

                  var next_counter = counter-1
                   if (hashTableSelectChoiceColor.retrieve(next_counter) == "ID-choice-B"){
                       $('#ID-choice-B').css('background-color', '#6bc8c4');
                       $('#ID-choice-C').css('background-color', '#436bb3');
                       $('#ID-choice-A').css('background-color', '#436bb3');
                       $('#ID-choice-D').css('background-color', '#436bb3');
                   }else if (hashTableSelectChoiceColor.retrieve(next_counter) == "ID-choice-A"){
                       $('#ID-choice-C').css('background-color', '#436bb3');
                       $('#ID-choice-A').css('background-color', '#6bc8c4');
                       $('#ID-choice-B').css('background-color', '#436bb3');
                       $('#ID-choice-D').css('background-color', '#436bb3');
                   } else if (hashTableSelectChoiceColor.retrieve(next_counter) == "ID-choice-C"){
                       $('#ID-choice-C').css('background-color', '#6bc8c4');
                       $('#ID-choice-A').css('background-color', '#436bb3');
                       $('#ID-choice-B').css('background-color', '#436bb3');
                       $('#ID-choice-D').css('background-color', '#436bb3');
                   } else if (hashTableSelectChoiceColor.retrieve(next_counter) == "ID-choice-D"){
                       $('#ID-choice-C').css('background-color', '#436bb3');
                       $('#ID-choice-A').css('background-color', '#436bb3');
                       $('#ID-choice-B').css('background-color', '#436bb3');
                       $('#ID-choice-D').css('background-color', '#6bc8c4');
                   } else {
                       $('#ID-choice-C').css('background-color', '#436bb3');
                       $('#ID-choice-A').css('background-color', '#436bb3');
                       $('#ID-choice-B').css('background-color', '#436bb3');
                       $('#ID-choice-D').css('background-color', '#436bb3');
                   }

                counter -= 1;
                if (counter > 0 && counter != 60){
                  $('#ID-question-number').html(counter);
                  getQuestionStatment(counter);
                  getChoices(counter);
                  getTextResource();
                  getImageResource(counter);
                }
                else{
                  counter = 1;
                  if (examsInsubject[i].subject == 5 || examsInsubject[i].subject == 22 || examsInsubject[i].subject == 23){
                    counter = 61;
                  }
                  // $('#ID-question-number').html(counter);
                  // getQuestionStatment(counter);
                  // getChoices(counter);
                  // getTextResource();
                  // getImageResource(counter);
                  $('#ID-main-section').empty();
                  $('#ID-lead-instruction').html('Choose  an exam');
                  exam_per_subject.getExams(current_subject);
                }
                MathJax.Hub.Queue(["Typeset",MathJax.Hub,jQuery.find(".math-tex")]);

              });

           });

       });
       //reverse list to normal
       examsInsubject = exams[i].exams.reverse();
       }

    }
  }

  }

  var exam_object = new Exams();

  $('#ID-header-image').on('click', function(){
    $('#ID-main-section').empty();
    $('#ID-named-subject-tab').empty();
    $('#ID-lead-instruction').html('Choose  a subject');
    subjectIDs = [];
    subject_obj.renderSubjects();
    new Exams();
  });

var exam_per_subject = new Exams();
$('#ID-named-subject-tab').on('click', () => {
  $('#ID-main-section').empty();
  $('#ID-lead-instruction').html('Choose  an exam');
  exam_per_subject.getExams(current_subject);
})
