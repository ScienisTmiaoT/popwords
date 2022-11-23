// avoid browser caches data.js by inserting an unique identifier
document.getElementById('datajs').src = 'js/data.js' + '?v=' + Date.now();


const jsonData = JSON.parse(data);
const rawData = jsonData["data"];
var title = document.querySelector('#title');
title.innerHTML = jsonData["title"];
var topic = document.querySelector('#topic');
topic.innerHTML = "#" + jsonData["topic"] + "# 今日热词";

// Don't forget to load dom. Otherwise, makeWordCloud function might fails to work.
// Make sure the format => [ {"word": String, "value": Number}, ..., ... ]
// Value should be greater than 0

var pairs = rawData.split(" ")
var data = []
for (let pair of pairs) {
    var p = pair.split(":")
    data.push({
        "word": p[0],
        "value": parseInt(p[1])
    })
}

// you can use own color converting function if you want
var my_color = d3.scale.category20();

/** for range slider */
var rangeSlider = document.getElementById("rs-range-line");
rangeSlider.setAttribute("max", data.length); 
rangeSlider.setAttribute("value", data.length); 
var rangeBullet = document.getElementById("rs-bullet");

rangeSlider.addEventListener("input", showSliderValue, false);

function showSliderValue() {
  rangeBullet.innerHTML = rangeSlider.value;
  var bulletPosition = (rangeSlider.value /rangeSlider.max);
  rangeBullet.style.left = (bulletPosition * 245) + "px";
  makeWordCloud(data.slice(0, rangeSlider.value), "#hello", 600, "my_svg", "Impact", true, my_color);
}
/* range slider ends */

// init
showSliderValue();

// makeWordCloud(data, css selector that you wanna insert in, scale of svg, class name of svg, font-family, rotate or not, your color converting function)
// makeWordCloud(data, "#hello", 600, "my_svg", "Impact", true, my_color)



// [ svg class, font-family, rotate words or not, color function ] are optional.
// the simplest way => window.makeWordCloud(data, "body", 500)

function makeWordCloud (data, parent_elem, svgscale, svg_class, font, rotate_word, my_colors) {

    var fill = d3.scale.category20();

    function draw(words) {
        d3.select(parent_elem).append("svg")
            .attr("viewBox", `0 0 ${svgscale} ${svgscale}`)
            .attr("preserveAspectRatio", "xMinYMin meet")
            // .attr("width", svgscale)
            // .attr("height", svgscale)
            .attr("class", svg_class)
            .append("g")
            .attr("transform", "translate(" + svgscale / 2 + "," + svgscale / 2 + ")")
            .selectAll("text")
            .data(words)
            .enter().append("text")
            .style("font-size", function (d) {
                return d.size + "px";
            })
            .style("font-family", font)
            .style("fill", function (d, i) {
                if (my_colors) {
                    return my_colors(i);
                } else {
                    return fill(i);
                }
            })
            .attr("text-anchor", "middle")
            .attr("transform", function (d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function (d) {
                return d.text;
            });
    }

    if (svg_class) {
        d3.select("." + svg_class).remove()
    } else {
        d3.select("svg").remove()
    }

    var data_max = d3.max(data, function (d) {
        return d.value
    });
    var sizeScale = d3.scale.linear().domain([0, data_max]).range([0, 1])

    data = data.map(function (d) {
        return {
            text: d.word,
            size: 10 + sizeScale(d.value) * 90
        };
    })

    var layout = d3.layout.cloud().size([svgscale, svgscale])
        .words(data)
        .padding(5)
        .fontSize(function (d) {
            return d.size;
        })

    if (!rotate_word) {
        layout.rotate(function () {
            return ~~(Math.random() * 2) * 90;
        })
    }

    layout
        .on("end", draw)
        .start();
}