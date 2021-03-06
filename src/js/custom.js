const d3 = require("d3");

function setCookie() {
  var id = Date.now();
  var d = new Date();
  d.setTime(d.getTime() + 7 * 24 * 60 * 60 * 1000);
  var expires = "expires=" + d.toUTCString();
  document.cookie = "userid=" + id + ";" + expires + ";path=/";
}

function getCookie() {
  var decodedCookie = decodeURIComponent(document.cookie);
  var a = decodedCookie.split(";");
  var c = a[0].replace("userid=", "");
  return c;
}

if ($("body").is(".consent")) {
  setCookie();
  document.getElementById("agreeBtn").onclick = function () {
    var uid = getCookie();
    var d = new Date();
    setTimestamp(uid, String(d));
  };
}

var startTime;
var i = 0;
var size = 1.5;
if (window.matchMedia("(max-width: 500px)").matches) {
  size = 0.85;
}

// functions to add horizontal bars, buttons and rows to the queston form

const qform = document.getElementById("questions");
var j = 1;
var k = 1;
var values = {};
var hbars = {};
var barSpans = {};
var rads = {};
var radLbls = {};
var options = {};
var trueAnswers = {};
var userScores = {};
var means = {};
var stanDs = {};
var qs = [];
var qcodes = [];
var maxScores = [];
var diffs = [];

function addRow(slide) {
  const newRow = document.createElement("div");
  newRow.className = "form-row my-md-3";
  slide.appendChild(newRow);
  const col = document.createElement("div");
  col.className = "col-md-6";
  newRow.appendChild(col);
}

function addSliders(slide, num) {
  const col = document.createElement("div");
  col.className = "col-md-6";
  slide.append(col);
  var bar = document.createElement("input");
  bar.type = "range";
  bar.className = "form-control-range";
  bar.id = "bar" + i + "_" + j;
  bar.value = num;
  col.appendChild(bar);
  var barSpan = document.createElement("span");
  barSpan.className = "font-weight-bold text-primary ml-2 mt-1";
  barSpan.id = "barSpan" + i + "_" + j;
  barSpan.innerHTML = num + "%";
  col.appendChild(barSpan);
  var barID = "bar" + i + "_" + j;
  var barSpanID = "barSpan" + i + "_" + j;
  var barsNum = "bars" + i;
  hbars[barsNum].push(barID);
  barSpans[barsNum].push(barSpanID);
  var valuesNum = "values" + i;
  var valPos = j - 1;

  values[valuesNum][valPos] = num;

  j++;
}

function addRads(slide) {
  var radCol = document.createElement("div");
  radCol.className = "col-md-6";
  slide.append(radCol);
  radCol.style.display = "inline-block";
  var rad = document.createElement("input");
  rad.type = "radio";
  rad.className = "radio";
  rad.id = "radio" + i + "_" + k;
  radCol.appendChild(rad);
  var radID = "radio" + i + "_" + k;
  var radLbl = document.createElement("label");
  radLbl.className = "radLbl";
  radLbl.id = "radLbl" + i + "_" + k;
  radLbl.for = radID;
  radCol.appendChild(radLbl);
  var radLblID = "radLbl" + i + "_" + k;
  var radsNum = "rads" + i;
  var radLblsNum = "radLbls" + i;
  rads[radsNum].push(radID);
  radLbls[radLblsNum].push(radLblID);

  k++;
}

var slideNo = 1;
var currentSlideID = "slide" + slideNo;

function readData(file, section) {
  d3.csv(file).then(function (data) {
    data.forEach(function (d) {
      i++;

      var slide = document.createElement("div");
      slide.className = "slide";
      slide.id = "slide" + i;
      var slideID = "#slide" + i;
      qform.appendChild(slide);
      var uid = getCookie();

      var questionNum = "question" + i;
      var valuesNum = "values" + i;
      var barsNum = "bars" + i;
      var optionsNum = "options" + i;
      var radsNum = "rads" + i;
      var radLblsNum = "radLbls" + i;
      var numOfOpts = 0;
      var ansIndexNum = "answers" + i;

      d3.select(slideID)
        .append("label")
        .text("( " + i + " / 21 ). " + d.Question);
      qs.push(d.Question);
      addRow(slide);
      d3.select(slideID).append("label").text("Your Answer:");
      addRow(slide);

      addRads(slide);
      document.getElementById(radLbls[radLblsNum][0]).innerHTML = d.Option1;
      options[optionsNum].push(d.Option1);
      numOfOpts++;

      addRads(slide);
      document.getElementById(radLbls[radLblsNum][1]).innerHTML = d.Option2;
      options[optionsNum].push(d.Option2);
      numOfOpts++;
      addRow(slide);

      if (d.Option3 != "") {
        addRads(slide);
        document.getElementById(radLbls[radLblsNum][2]).innerHTML = d.Option3;
        options[optionsNum].push(d.Option3);
        numOfOpts++;
        addRow(slide);
      }

      var qcode = d.key;
      var year = d.year;
      qcodes.push(qcode);

      var count = Math.floor(100 / numOfOpts);
      var extra;
      if (count * numOfOpts == 100) {
        extra = 0;
      } else {
        extra = 100 - count * numOfOpts;
      }

      if (qcode != "covid19") {
        addRow(slide);
        d3.select(slideID)
          .append("label")
          .text(
            "What percentage of the British public do you think chose each answer? "
          );
        var yearlbl = document.createElement("i");
        yearlbl.innerHTML = " (Data from the year " + year + ")";
        slide.appendChild(yearlbl);
        addRow(slide);

        d3.select(slideID).append("label").text(d.Option1);
        addSliders(slide, count + extra);
        addRow(slide);

        d3.select(slideID).append("label").text(d.Option2);
        addSliders(slide, count);
        addRow(slide);

        if (d.Option3 != "") {
          d3.select(slideID).append("label").text(d.Option3);
          addSliders(slide, count);
          addRow(slide);
        }
      }

      var radErrText = document.createElement("div");
      radErrText.innerHTML = "*Please select your answer to the question";
      radErrText.id = "radErrText" + i;
      radErrText.className = "alert alert-danger";
      radErrText.role = "alert";
      radErrText.style.display = "none";
      slide.appendChild(radErrText);
      var radErrTextID = "radErrText" + i;

      addRow(slide);

      var confBtn = document.createElement("button");
      confBtn.type = "button";
      confBtn.innerHTML = "Confirm";
      confBtn.id = "confirm" + i;
      confBtn.className = "btn btn-primary my-md-3";
      slide.appendChild(confBtn);
      var conBtnID = "confirm" + i;

      addRow(slide);

      // ensuring only one radio button can be checked at a time
      for (var r3 = 0; r3 < rads[radsNum].length; r3++) {
        document
          .getElementById(rads[radsNum][r3])
          .addEventListener("click", function () {
            var theRad = this;
            for (var r4 = 0; r4 < rads[radsNum].length; r4++) {
              if (theRad != document.getElementById(rads[radsNum][r4])) {
                document.getElementById(rads[radsNum][r4]).checked = false;
              }
            }
          });
        document
          .getElementById(radLbls[radLblsNum][r3])
          .addEventListener("click", function () {
            var theRadLbl = this;
            var str = theRadLbl.id;
            var newStr = str.replace("radLbl", "radio");
            var activeRad = document.getElementById(newStr);
            activeRad.checked = true;
            for (var r5 = 0; r5 < rads[radsNum].length; r5++) {
              if (activeRad != document.getElementById(rads[radsNum][r5])) {
                document.getElementById(rads[radsNum][r5]).checked = false;
              }
            }
          });
      }

      var splice;
      if (i >= 10) {
        splice = 6;
      } else {
        splice = 5;
      }

      if (qcode != "covid19") {
        // keeping the sliders at 100%
        if (numOfOpts == 2) {
          for (var b = 0; b < hbars[barsNum].length; b++) {
            document
              .getElementById(hbars[barsNum][b])
              .addEventListener("input", function () {
                var str = this.id;
                var ind = parseInt(str.substr(splice), 10) - 1;
                var bar1 = document.getElementById(hbars[barsNum][0]);
                var bar2 = document.getElementById(hbars[barsNum][1]);
                var span1 = document.getElementById(barSpans[barsNum][0]);
                var span2 = document.getElementById(barSpans[barsNum][1]);
                if (ind == 0) {
                  span1.innerHTML = bar1.value + "%";
                  bar2.value = 100 - bar1.value;
                  span2.innerHTML = bar2.value + "%";
                } else {
                  span2.innerHTML = bar2.value + "%";
                  bar1.value = 100 - bar2.value;
                  span1.innerHTML = bar1.value + "%";
                }
                values[valuesNum][0] = bar1.value;
                values[valuesNum][1] = bar2.value;
              });
          }
        } else {
          var prop = 0.5;
          for (var b = 0; b < hbars[barsNum].length; b++) {
            document
              .getElementById(hbars[barsNum][b])
              .addEventListener("input", function () {
                var str = this.id;
                var ind = parseInt(str.substr(splice), 10) - 1;
                var bar1 = document.getElementById(hbars[barsNum][0]);
                var bar2 = document.getElementById(hbars[barsNum][1]);
                var bar3 = document.getElementById(hbars[barsNum][2]);
                var span1 = document.getElementById(barSpans[barsNum][0]);
                var span2 = document.getElementById(barSpans[barsNum][1]);
                var span3 = document.getElementById(barSpans[barsNum][2]);

                if (ind == 0) {
                  span1.innerHTML = bar1.value + "%";
                  bar2.value = 100 - bar1.value - bar3.value;
                  span2.innerHTML = bar2.value + "%";
                  if (bar2.value == 0) {
                    span2.innerHTML = "0%";
                    bar3.value = 100 - bar1.value;
                    span3.innerHTML = bar3.value + "%";
                  }
                  prop = bar1.value / (100 - bar3.value);
                } else if (ind == 1) {
                  span2.innerHTML = bar2.value + "%";
                  bar1.value = 100 - bar2.value - bar3.value;
                  span1.innerHTML = bar1.value + "%";
                  if (bar1.value == 0) {
                    span1.innerHTML = "0%";
                    bar3.value = 100 - bar2.value;
                    span3.innerHTML = bar3.value + "%";
                  }
                  prop = bar1.value / (100 - bar3.value);
                } else {
                  span3.innerHTML = bar3.value + "%";
                  var diff = 100 - bar3.value;
                  bar1.value = Math.floor(diff * prop);
                  span1.innerHTML = bar1.value + "%";
                  bar2.value = 100 - bar1.value - bar3.value;
                  span2.innerHTML = bar2.value + "%";
                  if (bar2.value == 0) {
                    span2.innerHTML = "0%";
                    bar1.value = 100 - bar3.value;
                    span1.innerHTML = bar1.value + "%";
                  }
                  if (bar1.value == 0) {
                    span1.innerHTML = "0%";
                    bar2.value = 100 - bar3.value;
                    span2.innerHTML = bar2.value + "%";
                  }
                }

                values[valuesNum][0] = bar1.value;
                values[valuesNum][1] = bar2.value;
                values[valuesNum][2] = bar3.value;
              });
          }
        }
      }

      // submitting data and disabling buttons after the confirm button is clicked
      document.getElementById(conBtnID).addEventListener("click", function () {
        document.getElementById(conBtnID).disabled = true;
        var endTime = Date.now();
        var difference = (endTime - startTime) / 1000;
        saveTime(uid, section, qcode, difference);
        if (qcode != "covid19") {
          writeData(
            uid,
            section,
            qcode,
            options[optionsNum].length,
            values[valuesNum]
          );
          saveUserScore(
            uid,
            values[valuesNum],
            trueAnswers[ansIndexNum],
            section,
            qcode,
            questionNum
          );
        }

        var selected = 0;
        for (var r2 = 0; r2 < rads[radsNum].length; r2++) {
          if (document.getElementById(rads[radsNum][r2]).checked == true) {
            selected++;
            var ans = document.getElementById(radLbls[radLblsNum][r2])
              .innerHTML;
            writeAnswer(uid, section, qcode, ans);
          }
        }
        if (selected == 0) {
          document.getElementById(conBtnID).type = "button";
          document.getElementById(conBtnID).disabled = false;
          document.getElementById(radErrTextID).style.display = "block";
        } else {
          document.getElementById(radErrTextID).style.display = "none";
          if (qcode != "covid19") {
            slideNo++;
            var nextSlide = "slide" + slideNo;
            showSlide(nextSlide, currentSlideID, slideNo);
            currentSlideID = "slide" + slideNo;
            startTime = Date.now();
            window.scrollBy(0, -500);
          }
        }
      });

      j = 1;
      k = 1;
    });

    showSlide(currentSlideID, currentSlideID, slideNo);
  });
}

if ($("body").is(".quiz1")) {
  readData("Sample-Data/questions.csv", "answers");
  readTrueAns("Sample-Data/questions.csv");
  const nextBtn = document.getElementById("nextBtn");
  window.addEventListener("load", function () {
    startTime = Date.now();
  });

  window.onbeforeunload = function () {
    return "Are you sure? All of your progress will be lost.";
  };
}

function showNextSlide(slideNo, currentSlideID) {
  slideNo++;
  var nextSlide = "slide" + slideNo;
  showSlide(nextSlide, currentSlideID, slideNo);
  currentSlideID = "slide" + slideNo;
}

for (var num = 0; num < 21; num++) {
  var v = "values" + (num + 1);
  var barsNum = "bars" + (num + 1);
  var o = "options" + (num + 1);
  var r = "rads" + (num + 1);
  var rl = "radLbls" + (num + 1);
  var tr = "answers" + (num + 1);
  var q = "question" + (num + 1);
  values[v] = [];
  hbars[barsNum] = [];
  barSpans[barsNum] = [];
  options[o] = [];
  rads[r] = [];
  radLbls[rl] = [];
  trueAnswers[tr] = [];
  userScores[q] = 0;
}

function showSlide(n, currentSlideID, slideNo) {
  document.getElementById(currentSlideID).className = "slide";
  document.getElementById(n).className = "active-slide";
  if (slideNo == i) {
    document.getElementById("nextBtn").style.display = "none";
    finalSlides();
  }
}

// creates a bar chart using d3
function createChart(data, qIndex) {
  var vis = document.getElementById("vis");

  var width = 500;
  var height = 600;
  var bottomMar = 200;

  if (qIndex == 5 || qIndex == 17 || qIndex == 20) {
    height = 700;
    bottomMar = 380;
  }

  if (window.matchMedia("(max-width: 500px)").matches) {
    width = 300;
  }

  var maxValue = 100;

  var margin = {
    top: 30,
    left: 70,
    right: 30,
    bottom: bottomMar,
  };

  var svg = d3
    .select("#vis")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + margin.top + "," + margin.left + ")");

  width = width - margin.left - margin.right;
  height = height - margin.top - margin.bottom;

  var yscale = d3.scaleLinear().range([height, 0]).domain([0, maxValue]);

  var xscale = d3.scaleBand().range([0, width]).padding(0.1);

  var duration = 1000;

  var xaxis = d3.axisBottom(xscale);
  var yaxis = d3.axisLeft(yscale);

  svg
    .append("g")
    .attr("transform", "translate(0, " + height + ")")
    .attr("class", "x axis");

  svg.append("g").attr("class", "y axis");

  if (data == values) {
    var vNum = "values" + qIndex;
    var fill = "#e3546c";
    var title = "Your Answers";
  } else {
    var vNum = "answers" + qIndex;
    var fill = "#042975";
    var title = "Actual Answers";
  }

  var oNum = "options" + qIndex;
  var qNum = "question" + qIndex;

  var qlblID = "questionLbl" + qIndex;
  document.getElementById(qlblID).innerHTML = qIndex + ". " + qs[qIndex - 1];

  var rLblID = "resultLbl" + qIndex;
  document.getElementById(rLblID).innerHTML =
    "Question difficulty: " +
    diffs[qIndex - 1] +
    ". Points available: " +
    Math.round(maxScores[qIndex - 1] / 10) +
    ". You scored: " +
    Math.round(userScores[qNum] / 10);

  xscale.domain(options[oNum]);
  yscale.domain([0, maxValue]);

  var bars = svg.selectAll(".bar").data(data[vNum]);

  bars
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("fill", fill)
    .attr("width", xscale.bandwidth())
    .attr("height", 0)
    .attr("y", height)
    .merge(bars)
    .transition()
    .duration(duration)
    .attr("height", function (d, i) {
      return height - yscale(d);
    })
    .attr("y", function (d, i) {
      return yscale(d);
    })
    .attr("width", xscale.bandwidth())
    .attr("x", function (d, i) {
      return xscale(options[oNum][i]);
    });

  svg
    .append("text")
    .attr("class", "title")
    .attr("text-anchor", "middle")
    .attr("y", 0 - margin.top)
    .attr("x", 0 + width / 2)
    .text(title);

  svg
    .select(".x.axis")
    .transition()
    .duration(duration)
    .call(xaxis)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-65)");

  svg.select(".y.axis").transition().duration(duration).call(yaxis);
}

function finalSlides() {
  var uid = getCookie();
  var slideID = "slide21";
  var theSlide = document.getElementById(slideID);
  var conID = "confirm21";
  document.querySelector("#top h6").innerHTML =
    "No sliders for this question! Please select your answer: ";
  document.getElementById(conID).addEventListener("click", function () {
    document.getElementById("nextBtn").style.display = "none";
    var num = 0;
    theSlide.innerHTML = "";
    location.href = "#top";
    theSlide.className = "active-slide";

    window.scrollBy(0, -200);
    document.querySelector("#top h2").innerHTML = "Well Done!";
    document.querySelector("#top h6").innerHTML = "";
    var heading = document.createElement("h6");
    theSlide.appendChild(heading);
    addRow(theSlide);
    document.getElementById("nextBtn").style.display = "inline-block";
    var totalScore = 0;
    var totalMax = 0;
    for (var s1 = 1; s1 < 21; s1++) {
      var qnum = "question" + s1;
      totalScore += userScores[qnum];
      totalMax += maxScores[s1 - 1];
    }

    var roundScore = Math.round(totalScore);
    theSlide.innerHTML = "";
    var scoreLbl = document.createElement("h5");
    var theScore = document.createElement("label");
    scoreLbl.innerHTML = "Interested to know how you did? ";
    theSlide.appendChild(scoreLbl);
    theScore.innerHTML =
      "Your total score was " +
      Math.round(roundScore / 10) +
      " out of a possible " +
      Math.round(totalMax / 10) +
      " (" +
      Math.round((roundScore / totalMax) * 100) +
      "%). Below you can see how your guesses for each question compared to the real data, ordered from worst to best. Feel free to save or print this page if desired (once you click 'Next', you will not be able to retrieve these results).";
    saveFinalScore(uid, Math.round((roundScore / totalMax) * 100));
    theSlide.appendChild(theScore);

    delete userScores.question21;

    var sortable = [];
    for (var item in userScores) {
      sortable.push([item, userScores[item]]);
    }

    sortable.sort(function (a, b) {
      return a[1] - b[1];
    });

    var topNextBtn = document.createElement("button");
    topNextBtn.innerHTML = "next >>";
    topNextBtn.style.float = "right";
    topNextBtn.className = "btn btn-primary my-md-3";
    topNextBtn.type = "button";
    theSlide.appendChild(topNextBtn);

    addRow(theSlide);

    var vis = document.createElement("div");
    vis.id = "vis";
    theSlide.appendChild(vis);

    for (var ind = 0; ind < sortable.length; ind++) {
      var qlbl = document.createElement("label");
      var q = sortable[ind][0];
      var num = parseInt(q.replace("question", ""), 10);
      qlbl.id = "questionLbl" + num;
      var resultLbl = document.createElement("label");
      resultLbl.id = "resultLbl" + num;
      if (ind == 0) {
        var aLbl = document.createElement("label");
        aLbl.innerHTML = "Your lowest scoring answer: ";
        vis.appendChild(aLbl);
        addRow(vis);
      } else if (ind == 1) {
        var aLbl = document.createElement("label");
        aLbl.innerHTML = "Your second lowest scoring answer: ";
        vis.appendChild(aLbl);
        addRow(vis);
      }
      vis.appendChild(qlbl);
      addRow(vis);
      vis.appendChild(resultLbl);
      addRow(vis);
      addRow(vis);
      createChart(values, num);
      createChart(trueAnswers, num);
      addRow(vis);
    }

    window.onbeforeunload = null;
    var btnarray = [nextBtn, topNextBtn];
    for (var item = 0; item < btnarray.length; item++) {
      btnarray[item].onclick = function () {
        window.location.href = "feedback.html";
      };
    }
  });
}

// reads in scoring csv file and adds the original BSAS results into arrays
var ansIndexNum = 0;
function readTrueAns(file) {
  d3.csv(file).then(function (data) {
    data.forEach(function (d) {
      ansIndexNum++;
      var ansIndex = "answers" + ansIndexNum;
      var qIndex = "question" + ansIndexNum;
      var ind = ansIndexNum - 1;

      trueAnswers[ansIndex][0] = parseInt(d.score1);
      trueAnswers[ansIndex][1] = parseInt(d.score2);
      if (d.Option3 != "") {
        trueAnswers[ansIndex][2] = parseInt(d.score3);
      }

      means[qIndex] = parseFloat(d.mean);
      stanDs[qIndex] = parseFloat(d.sd);
      maxScores[ind] = Math.round(parseFloat(d.Max));
      diffs[ind] = d.difficulty;

      var sum = trueAnswers[ansIndex].reduce((a, b) => a + b, 0);

      if (sum != 100) {
        for (var a = 0; a < trueAnswers[ansIndex].length; a++) {
          trueAnswers[ansIndex][a] = (trueAnswers[ansIndex][a] / sum) * 100;
        }
      }
    });
  });
}

import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/database";
import "firebase/firestore";

var firebaseConfig = {
  apiKey: "AIzaSyDwPtv1K4gKbvCQTKbfCsu_XX_9xuDjFiw",
  authDomain: "simplified-quiz.firebaseapp.com",
  databaseURL: "https://simplified-quiz-default-rtdb.firebaseio.com",
  projectId: "simplified-quiz",
  storageBucket: "simplified-quiz.appspot.com",
  messagingSenderId: "1027243073330",
  appId: "1:1027243073330:web:7faa73070d209eb416012b",
  measurementId: "G-T5DXKHV1NB",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// saves users answers to the database
function writeData(uid, section, qcode, num, answers) {
  if (num == 2) {
    firebase
      .database()
      .ref("/" + uid + "/" + section + "/" + qcode + "/guess_of_public/")
      .set(
        {
          opt1: answers[num - 2],
          opt2: answers[num - 1],
        },
        function (error) {
          if (error) {
            alert("Data could not be saved" + error);
          } else {
            console.log("write successful");
          }
        }
      );
  }
  if (num == 3) {
    firebase
      .database()
      .ref("/" + uid + "/" + section + "/" + qcode + "/guess_of_public/")
      .set(
        {
          opt1: answers[num - 3],
          opt2: answers[num - 2],
          opt3: answers[num - 1],
        },
        function (error) {
          if (error) {
            alert("Data could not be saved" + error);
          } else {
            console.log("write successful");
          }
        }
      );
  }
}

// time stamp for each question
function saveTime(uid, section, qcode, time) {
  if (qcode == "") {
    firebase
      .database()
      .ref("/" + uid + "/" + section + "/timer/")
      .set({
        Timer: time,
      });
  } else {
    firebase
      .database()
      .ref("/" + uid + "/" + section + "/" + qcode + "/timer/")
      .set({
        Timer: time,
      });
  }
}

// save the user's actual answer
function writeAnswer(uid, section, qcode, ans) {
  firebase
    .database()
    .ref("/" + uid + "/" + section + "/" + qcode + "/their_answer/")
    .set({
      answer: ans,
    });
}

// Calculate and save user score
function saveUserScore(uid, user_answers, true_answers, section, qcode, qnum) {
  var userScore = sumDiff(user_answers, true_answers);
  var normScore = Math.round((100 * (means[qnum] - userScore)) / stanDs[qnum]);
  userScores[qnum] = normScore;
  firebase
    .database()
    .ref("/" + uid + "/" + section + "/" + qcode + "/score/")
    .set({
      score: normScore,
    });
}
// save user feedback to firebase
function saveFeedback(uid, vals, text) {
  firebase
    .database()
    .ref("/" + uid + "/feedback/")
    .set({
      change_opinion: vals[0],
      interesting: vals[1],
      other_fb: text,
    });
}

function setTimestamp(uid, time) {
  firebase
    .database()
    .ref("/" + uid + "/timestamp/")
    .set(
      {
        timestamp: time,
      },
      function (error) {
        if (error) {
          console.log("fail");
        } else {
          window.location.href = "quiz.html";
        }
      }
    );
}

function saveFinalScore(uid, score) {
  firebase
    .database()
    .ref("/" + uid + "/final_score/")
    .set({
      score_as_percentage: score,
    });
}

function sumDiff(a, b) {
  var sdiff = 0;
  for (var v = 0; v < a.length; v++) {
    sdiff += Math.abs(a[v] - b[v]);
    return sdiff;
  }
}

var fback = [];
// functionality for the feedback section of the quiz
if ($("body").is(".feedback")) {
  var uid = getCookie();
  var yesRad = document.getElementById("yesChange");
  var noRad = document.getElementById("noChange");
  var notRad = document.getElementById("intNo");
  var litRad = document.getElementById("intLittle");
  var quiteRad = document.getElementById("intQuite");
  var veryRad = document.getElementById("intVery");
  var txtArea = document.getElementById("openFeedback");

  yesRad.addEventListener("click", function () {
    noRad.checked = false;
    fback[0] = "Yes";
  });

  noRad.addEventListener("click", function () {
    yesRad.checked = false;
    fback[0] = "No";
  });

  notRad.addEventListener("click", function () {
    litRad.checked = false;
    quiteRad.checked = false;
    veryRad.checked = false;
    fback[1] = "Not at all";
  });

  litRad.addEventListener("click", function () {
    notRad.checked = false;
    quiteRad.checked = false;
    veryRad.checked = false;
    fback[1] = "A little";
  });

  quiteRad.addEventListener("click", function () {
    litRad.checked = false;
    notRad.checked = false;
    veryRad.checked = false;
    fback[1] = "Quite interesting";
  });

  veryRad.addEventListener("click", function () {
    litRad.checked = false;
    quiteRad.checked = false;
    notRad.checked = false;
    fback[1] = "Very interesting";
  });

  document
    .getElementById("fbackConfirm")
    .addEventListener("click", function () {
      document.getElementById("fbErrText").style.display = "none";
      var txt = txtArea.value;
      saveFeedback(uid, fback, txt);
      yesRad.disabled = true;
      noRad.disabled = true;
      notRad.disabled = true;
      litRad.disabled = true;
      quiteRad.disabled = true;
      veryRad.disabled = true;
      txtArea.disabled = true;
    });
}
