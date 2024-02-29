import './style.css';
import * as d3 from 'd3';

const url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json';
const w = 1500;
const h = 500;
const paddingHorizonal = 100;
const paddingBottom = 120;
const paddingTop = 10;
const legendLength = 400;

const formatMonth = d =>{
  const months = ['January','February','March','April',
    'May','June','July','August','September','October','November','December'];
  return months[d - 1];
}

let source = null;
await fetch(url)
  .then(data => data.json())
  .then(data => {
    source = data;
  })
  .catch(error => console.error(error));

const baseTemperature = source.baseTemperature;
const dataset = source.monthlyVariance;
const colors = [[0,0,255],[0,127,255],[0,255,255],[67,255,194],
[127,255,127],[194,255,67],[255,255,0],[255,127,0],[255,0,0]];
const svg = d3.select('#container')
              .append('svg')
              .attr('width',w)
              .attr('height',h);
const xScale = d3.scaleLinear()
                .domain([d3.min(dataset,d => d.year),d3.max(dataset,d => d.year)])
                .range([paddingHorizonal,w-paddingHorizonal]);
const yScale = d3.scaleLinear()
                .domain([d3.min(dataset,d => d.month),d3.max(dataset,d => d.month)])
                .range([paddingTop,h-paddingBottom-((h-paddingBottom-paddingTop) / 12)]);
const tempScale = d3.scaleLinear()
                .domain([d3.min(dataset,d => d.variance),d3.max(dataset,d => d.variance)])
                .range([0,colors.length - 0.01]);
const legendScale = d3.scaleLinear()
                .domain([d3.min(dataset,d => d.variance) + baseTemperature,
                  d3.max(dataset,d => d.variance) + baseTemperature])
                .range([0,legendLength]);
const colorsScale = d3.scaleLinear()
                .domain([0,colors.length])
                .range([0,legendLength]);

d3.select('#description').text(`1753 - 2015: base temperature ${baseTemperature}℃`);
svg.selectAll('rect')
  .data(dataset)
  .enter()
  .append('rect')
  .attr('x',d => xScale(d.year))
  .attr('y',d => yScale(d.month))
  .attr('width',(w-2*paddingHorizonal) * 12 / dataset.length)
  .attr('height',(h-paddingBottom-paddingTop) / 12)
  .attr('class','cell')
  .attr('fill','black')
  .attr('data-month',d => d.month - 1)
  .attr('data-year',d => d.year)
  .attr('data-temp',d => parseFloat((baseTemperature + d.variance).toFixed(3)))
  .attr('fill',d => {
    const index = Math.floor(tempScale(d.variance));
    return `rgb(${colors[index][0]},${colors[index][1]},${colors[index][2]})`;
  })
  .on('mouseover',function(event,d) {
    const rect = d3.select(this);
    const x = rect.attr('x');
    const y = rect.attr('y');
    const dataYear = rect.attr('data-year');
    const dataMonth = formatMonth(Number(rect.attr('data-month')) + 1);
    const dataTemp = rect.attr('data-temp');
    rect.attr('stroke','black')
        .attr('stroke-width',1);
    d3.select('#tooltip')
      .attr('data-year',dataYear)
      .style('visibility','visible')
      .style('transform',`translate(${x - 50}px,${y - 90}px)`)
      .html(`${dataYear} -${dataMonth}<br>${dataTemp}℃<br>${d.variance}℃`);
  })
  .on('mouseout',function(event,d) {
    d3.select(this).attr('stroke','none');
    d3.select('#tooltip')
      .style('visibility','hidden');
  });

const xAxis = d3.axisBottom(xScale).tickFormat(d => String(d));
const yAxis = d3.axisLeft(yScale)
.tickFormat(formatMonth);
const legendAxis = d3.axisBottom(legendScale).tickFormat(d => String(d));
svg.append('g')
  .attr('id','x-axis')
  .attr('transform',`translate(0,${h-paddingBottom})`)
  .call(xAxis);
svg.append('g')
  .attr('id','y-axis')
  .attr('transform',`translate(${paddingHorizonal},0)`)
  .call(yAxis);
svg.append('text')
  .text('Years')
  .attr('x',paddingHorizonal + w/2)
  .attr('y',h-paddingBottom + 40)
  .style('font-size','x-small');
svg.append('text')
  .text('Months')
  .attr('x',paddingHorizonal - 70)
  .attr('y',h / 2 - paddingTop - 30)
  .attr('transform-origin',`${paddingHorizonal - 70} ${h / 2 - paddingTop - 30}`)
  .attr('transform',`rotate(-90)`)
  .style('font-size','x-small');
const legend = svg.append('g')
  .attr('id','legend')
  .attr('transform',`translate(${paddingHorizonal},${h- 50})`)
  .call(legendAxis);
legend.selectAll('rect')
  .data(colors)
  .enter()
  .append('rect')
  .attr('x',(d,i) => colorsScale(i))
  .attr('y',-30)
  .attr('width',legendLength / colors.length)
  .attr('height',30)
  .attr('fill',d => `rgb(${d[0]},${d[1]},${d[2]})`)
  .attr('stroke','black')
  .attr('stroke-width',1);
