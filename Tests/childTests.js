/* Dependencies */
const tap = require('tap');
const canvas = require('canvas-wrapper');
const asyncLib = require('async');

module.exports = (course, callback) => {
    tap.test('child-template', (test) => {

        function checkQuiz(quiz, checkQuizCb) {
            if (quiz.time_limit === 120) {
                var d2lQuiz;
                // Check if the quiz should have a time limit of 120.
                d2lQuiz = d2lQuizzes.find(d2lQuizObj => {
                    return d2lQuizObj.name.toLowerCase() === quiz.title.toLowerCase();
                });
                if (d2lQuiz) {
                    // Check if the quiz had a time limit in d2l
                    if (d2lQuiz.enforceTimeLimit !== undefined) {
                        if (d2lQuiz.enforceTimeLimit[0].toLowerCase().includes('yes')) {
                            // Quiz should have a time limit of 120.
                            tap.pass();
                            checkQuizCb(null);
                            return;
                        }
                    } else {
                        // The enforce_time_limit was not found in the xml file. Throw an error
                        tap.fail('Error: Enforce Time Limit not found in the XML file:', d2lQuiz.name);

                    }
                } else {
                    // Quiz doesn't have a title in the XML file
                    tap.fail('Error: Quiz does not have a title in the XML file:', d2lQuiz.name);
                }
                checkQuizCb(null);
            } else if (quiz.time_limit === null) {
                // Check if the quiz time limit should be null
                d2lQuiz = d2lQuizzes.find(d2lQuizObj => {
                    return d2lQuizObj.name.toLowerCase() === quiz.title.toLowerCase();
                });
                if (d2lQuiz) {
                    // Check if the quiz had a time limit in d2l
                    if (d2lQuiz.enforceTimeLimit !== undefined) {
                        if (d2lQuiz.enforceTimeLimit[0].toLowerCase().includes('no') && quiz.time_limit === null) {
                            // Quiz should have a time limit of 120.
                            tap.pass();
                            checkQuizCb(null);
                            return;
                        } else {
                            tap.fail('Error: The D2L quiz has enforced time limit and/or the Canvas quiz does not have a time limit of null:', d2lQuiz.name);
                        }
                    } else {
                        // The enforce_time_limit was not found in the xml file. Throw an error
                        tap.fail('Error: Enforce Time Limit not found in the XML file:', d2lQuiz.name);

                    }
                } else {
                    // D2l Quiz doesn't  match a Canvas Quiz title
                    tap.fail('Error: A D2l quiz title does not match the Canvas Quiz Title');
                }
                checkQuizCb(null);
            } else {
                // Check if the time limit is still there
                if (typeof quiz.time_limit === 'number' && (quiz.time_limit !== 120 || quiz.time_limit !== null)) {
                    tap.pass();
                } else {
                    tap.fail('Error: The Canvas quiz time limit is not a number or the time limit is 120/null:', typeof quiz.time_limit, quiz.time_limit);
                }
                checkQuizCb(null);
            }
        }

        /************************************
         * START HERE
         ************************************/

        // Get all the quizzes xml files
        var d2lQuizFiles = course.content.filter(file => {
            return file.name.includes('quiz_d2l') || file.name.includes('survey_d2l');
        });
        // Make them into objects
        var d2lQuizzes = d2lQuizFiles.map(quizFile => {
            if (quizFile.name.includes('survey_d2l')) {
                return {
                    name: quizFile.dom('assessment').attr('title') || undefined,
                    enforceTimeLimit: ['no'] // D2l surveys cannot have time limits
                };
            } else {
                return {
                    name: quizFile.dom('assessment').attr('title') || undefined,
                    enforceTimeLimit: quizFile.dom('assess_procextension').html().match(/<d2l_2p0:enforce_time_limit>.+>/g) || undefined
                };
            }
        });

        canvas.get(`https://byui.instructure.com/api/v1/courses/${course.info.canvasOU}/quizzes`, (err, quizzes) => {
            if (err) {
                tap.fail(err);
                callback(null, course);
                return;
            }
            asyncLib.eachSeries(quizzes, checkQuiz, (err) => {
                if (err) {
                    tap.fail(err);
                    return;
                }
                // Quizzes have finished looping
                tap.pass();
            });
        });
        test.end();
    });



    // Always call the callback in your childTests with just null
    callback(null);
};