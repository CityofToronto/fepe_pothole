// The main javascript file for fepe_pothole.
// IMPORTANT:
// Any resources from this project should be referenced using SRC_PATH preprocessor var
// Ex: let myImage = '/*@echo SRC_PATH*//img/sample.jpg';

String.prototype.formatNumber = function(places=0) {  
  var n = this;
  var regex = /\d{1,3}(?=(\d{3})+(?!\d))/g;
  var intNum = typeof n != 'number' ? parseFloat(n.replace(/\,/g, '')) : n;

  if(places < 0){
    return intNum.toString().replace(regex, '$&,');
  } else {
    return intNum.toFixed(places).toString().replace(regex, '$&,');
  }
}


const getJSON = (url)=>{

  return new Promise(function(resolve,reject){
      const request = new XMLHttpRequest();
      request.open('GET', url, true);
      if(request){
        request.onload = function() {
            if (request.status >= 200 && request.status < 400) {
                // Success!
                const data = JSON.parse(request.responseText);
                resolve(data);
            } else {
                reject(new Error(`Error: ${JSON.parse(request.response)}`) )
                // We reached our target server, but it returned an error
            }
        };
        request.onerror = function() {
          // There was a connection error of some sort
          };
          request.send();
      }
     
  })
}


class Dashboard{
  constructor(){}

  Model(){
      return{
        meta:{
          title:'',
          enableSearch: true,
          cssGrid:{
            master:{
              'grid-template-columns': '40px 50px auto 50px 40px',
              'grid-template-rows': '25% 100px auto'
            },
            detail:{
              'grid-template-columns': '40px 50px auto 50px 40px',
              'grid-template-rows': '25% 100px auto'
            }
          },
          layout:[{
            panelID: 'panel--0000',
            class:'',
            icon:'png|gif|svg',
            widget:'card',
            widgetLink: 'master-detail', // http(s?)://
            cssGrid:{
              'grid-column-start': '2',
              'grid-column-end': 'five',
              'grid-row-start': 'row1-start',
              'grid-row-end': '3'
            }
          }]
        },
        panels:[{
          id:'panel-0000',
          label: 'Number of Personal Bankruptcies\n(Ontario)',
          caption: '',
          description:'',
          body:'',

          category:['Community Vulnerability'],
          keywords:[''],
          data:{
            calculatedValue: null,
            labels:[],
            datasets:{ label:'', data:[] }
          }
        }]
      }
  }
}



class PotholeData{
  constructor(){
    _self = this;
    this.today = new Date();
    this.dimension = null;
    this.filter = null;

    this.url = '/*@echo DATA_YTD*/?$format=json&unwrap=true';
    this.months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    this.colours = null;//['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854'];
  }
  

  calculateCumulativeData(_dataset,id){
    var b = [null];
    var sum = 0;
    _dataset.data.reduce((prev,curr,ndx,arr)=>{
      sum += arr[ndx-1];
      b.push(sum);
    });

    return [{
      stack:`ytd-${_dataset.label}`,
      label:`Previous Total (${_dataset.label})`,
      backgroundColor:'#ddd' ,
      data:b,
    },{
      stack:`ytd-${_dataset.label}`,
      label:`Added (${_dataset.label})`,
      backgroundColor: _dataset.backgroundColor,
      data:_dataset.data
    }];

    //console.debug('calculateCumulativeData',_dataset,id, updatedDataset, PHDATA.dimension)
    //return updatedDataset 
  }

  getData(dimension = this.dimension,filter=this.filter){
    console.debug('getData',dimension,filter, document.getElementById("ytd_toggle").checked);
    
    const showYTD = document.getElementById("ytd_toggle").checked;
    const url = showYTD?'/*@echo DATA_YTD*/?$format=json&unwrap=true':'/*@echo DATA_ANNUAL*/?$format=json&unwrap=true';
    //const url = '/*@echo DATA_ANNUAL*/?$format=json&unwrap=true';
    const onClick = function(dimension,e,d,t){
       
      /*
      if(d.length > 0){
        //document.getElementById('filter-button').style.display = null;
        let $potholeBar = document.getElementById('pothole-bar');
        
        d.forEach(dta=>{
          //dta._chart.chart.options = p.getData(dimension).chartOptions;         
          dta._chart.chart.data = p.getData(dimension,dta._model.label).chartData;        
          dta._chart.chart.update({
            duration: 800,
            easing: 'easeOutBounce'
          });
        })
        
      }
      */
      //$potholeBar.updateComponent();
    }
    
    var orderby = (function(){
      return dimension.split(',').map(d=>{
        return `${d} asc`
      }).join(',');
    })();

    return getJSON(`${url}&$apply=${filter?`filter(YEAR eq '${filter}')/`:``}groupby((${dimension}))/aggregate(POTHOLESFILLED with sum as total)&$orderby=${orderby}`).then(res=>{
      console.debug('getJSON',filter, res)
      var datasets = [];
      var labels = []; 
      var data =[];
      var backgroundColor = this.colours;
      if(dimension != 'YEAR'){
        var datasetTemp = [];
        labels = this.months;
        var obj = {}
        res.map((dataset,ndx)=>{
          var label='' 
          var index = parseInt(dataset[dimension.split(',')[0]]-1);
          data[index] = dataset['total']||null

          if( obj[ dataset[dimension.split(',')[1]] ] === undefined){
            obj[ dataset[dimension.split(',')[1]] ] = new Array(11)
          }         
          obj[ dataset[dimension.split(',')[1]] ][index ] = dataset['total']||null

          console.log('SHOW_YTD_COLOR',obj,filter,typeof(backgroundColor)=='string',backgroundColor)
        })

        


        var ndx = 0;
        for(var year in obj){
          if(typeof(backgroundColor)=='object'){
            datasetTemp.push({
              label: year,
              data: obj[year],
              backgroundColor: backgroundColor[ndx]
            })
          } else {
            datasetTemp.push({
              label: year,
              data: obj[year],
              backgroundColor: backgroundColor
            })
          }
          ndx++;
        }

        datasetTemp.sort(function(a,b){
          return a.label - b.label;
        });

        datasets = datasetTemp;
      }

      if(dimension == 'YEAR'){
        var datasetTemp = [];
        res.map((dataset,ndx)=>{
          labels.push( dataset[dimension] );
          data.push( dataset['total'] );          
        })

        datasetTemp = [{
          label:`Total Potholes Filled By Year ${filter?filter:''}`.trim(),
          data,
          backgroundColor
        }]

        datasets = datasetTemp;
      }

      if(showYTD){
        var d = new Array()
        var d = datasets.map((dataset,ndx)=>{
          console.log('SHOW_YTD',dataset);
          
          return this.calculateCumulativeData(dataset,ndx);


        })
        
        datasetTemp = new Array();
        d.forEach(dset=>{
          datasetTemp.push(dset[0])
          datasetTemp.push(dset[1])
        })

        datasets = datasetTemp;
        
      }


      return({
        chartOptions:{
          //showCount: false,
          onClick:function(e,d,t){
            /*
            switch(dimension){
              case 'MONTH':
                  _self.getData('YEAR').then(res=>{
                    let $potholeBar = document.getElementById('pothole-bar');
                    $potholeBar.data = res;
                  })
                
                break;
              case 'YEAR':
                  _self.getData("MONTH",d[0]._model.label ).then(res=>{
                    let $potholeBar = document.getElementById('pothole-bar');
                    $potholeBar.data = res;
                  })
                break;
            }
            */
          }
        },
        chartData:{
          labels,
          datasets
        }
      });
    })
  }
}




var PHDATA;
var colours = ['#66c2a5','#fc8d62','#8da0cb','#e78ac3','#a6d854'];
var updateCards;

$(function () {
  if (window['CotApp']) { //the code in this 'if' block should be deleted for embedded apps
    const app = new CotApp("fepe_pothole",{
      hasContentTop: false,
      hasContentBottom: false,
      hasContentRight: false,
      hasContentLeft: false,
      searchcontext: 'INTER'
    });
  }
  let container = $('#fepe_pothole_container');

  PHDATA = new PotholeData();
  PHDATA.colours = colours;
  PHDATA.dimension = 'YEAR'



  var $potholeFilled = document.getElementById('filled-counts');
      $potholeFilled.style.fontSize = '0.865em';
  var $widget = document.getElementById('pothole-bar');
  var $filters = document.getElementById('filter-button');


  updateCards=function(res){
    console.debug('updateCards', res, res.chartData.labels)
    let showYTD = document.getElementById("ytd_toggle").checked;
    let $potholeBar = document.getElementById('pothole-bar');
        $potholeBar.data = res;

        $potholeFilled.innerHTML = '';
        // document.querySelector('h2').innerText = showYTD?`Total Potholes Filled as of ${PHDATA.months[PHDATA.today.getMonth()]} ${PHDATA.today.getDate()} `:'Total Potholes Filled By Year'
        document.querySelector('h2').innerText = 'Total Potholes Filled By Year'

      res.chartData.labels.forEach((label,ndx)=>{
        const $card = document.createElement('cotui-chart');
        const chartColour = PHDATA.colours[ndx]
        $card.id = `filled-counts-${label}`;
        $card.setAttribute('chart-type','card');
        $card.setAttribute('chart-title',label);
        $card.setAttribute('chart-value', res.chartData.datasets[showYTD?1:0].data[ndx].toString().formatNumber());
        $card.setAttribute('chart-colour', chartColour );
        $card.setAttribute('href', '#filled-counts');
        $card.setAttribute('style',``);
        $card.setAttribute('caption',`${ndx == res.chartData.labels.length-1?`Year-to-Date`:`Year-End`}`); 
        $card.addEventListener('click',evt=>{
          document.getElementById('js-chart-title').innerHTML = `Potholes Filled in ${label} by Month`
          var $monthToggle = document.getElementById('month_toggle');
          $monthToggle.checked = true;
          PHDATA.colours = chartColour;
          PHDATA.dimension = 'MONTH,YEAR';
          PHDATA.filter = label;
          PHDATA.getData().then(res=>{
            //res.chartData.datasets[showYTD?0:1].backgroundColor = PHDATA.colours[ndx];
            $widget.data = res;
          })

        });
        
        if(ndx < 5)  $potholeFilled.append($card);        
      })
  }


  PHDATA.getData().then(res=>updateCards(res))
  
  //var colours=['#070f2b','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6'];
  
  // DataFilters Update Chart Based on function
    
    //$filters.style.display='none';
    // [{
    //   label:'Years',
    //   func:'YEAR'
    // },{
    //   label:'Months',
    //   func:'MONTH,YEAR'
    // }].forEach(btn=>{
    //   var $btn = document.createElement('button');
    //   $btn.type = 'button';
    //   $btn.classList.add('btn');
    //   $btn.classList.add('btn-default');
    //   $btn.innerText = btn.label;
    //   $btn.addEventListener('click',(evt)=>{
    //     evt.preventDefault();
    //     PHDATA.dimension = btn.func;
    //     PHDATA.getData().then(res=>{
    //       $widget.data = res;
    //     })
        
    //     /*
    //     $widget.getPlugin().then(ChartJS=>{
    //       ChartJS.chart.data = phdata.getData(btn.func).chartData;
    //       ChartJS.chart.update();
    //     })
    //     */
    //   })
    //   $filters.append($btn);
    // })
    
});

$(document).ready(function(){
  var $widget = document.getElementById('pothole-bar');
  var $ytdToggle = document.getElementById('ytd_toggle');
  var $ytdToggleLabel = $ytdToggle.parentElement.parentElement.querySelector('[for="ytd_toggle"]');
  var $component = $ytdToggle.parentElement.parentElement
      $component.setAttribute('tabindex','0');
      
  
  const handleChange = function(evt){
    if(!$ytdToggle.checked){
      $ytdToggle.checked = true;
      
      PHDATA.getData().then(res=>{
        //res.chartOptions.showCount = true;
        $widget.stacked = true;
        $widget.data = res;
      })
    } else {
      $ytdToggle.checked = false;
      PHDATA.getData().then(res=>{
        //res.chartOptions.showCount = false;
        $widget.stacked = false;
        $widget.data = res;
      })
    }
    
  }

  $ytdToggleLabel.addEventListener('click',handleChange)
  $component.addEventListener('keydown',evt=>{
   if(evt.keyCode == 32) handleChange();
  })
  $ytdToggle.parentElement.addEventListener('click',handleChange)


  // MTD Toggle
  var $monthToggle = document.getElementById('month_toggle');
  var $monthToggleLabel = $monthToggle.parentElement.parentElement.querySelector('[for="month_toggle"]');
  var $componentMonth = $monthToggle.parentElement.parentElement
      $componentMonth.setAttribute('tabindex','0');
      
  
  const handleMonthChange = function(evt){
    if(!$monthToggle.checked){
      $monthToggle.checked = true;
      PHDATA.dimension = 'MONTH,YEAR';
      //PHDATA.filter = null;
      PHDATA.getData().then(res=>{
        $widget.data = res;
      })
    } else {
      $monthToggle.checked = false;
      PHDATA.dimension = 'YEAR';
      PHDATA.colours = colours;
      //PHDATA.filter = null;
      PHDATA.getData().then(res=>{
        $widget.stacked = false;
        $widget.data = res;

      })
    }
    
  }

  $monthToggleLabel.addEventListener('click',handleMonthChange)
  $componentMonth.addEventListener('keydown',evt=>{
   if(evt.keyCode == 32) handleMonthChange();
  })
  $monthToggle.parentElement.addEventListener('click',handleMonthChange)



});
