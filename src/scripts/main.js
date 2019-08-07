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
  }


  getData(dimension='ytd',year){
    const onClick = function(dimension,e,d,t){
      var p = new window.PotholeData();
      
      
      if(d.length > 0){
        document.getElementById('filter-button').style.display = null;
        let $potholeBar = document.getElementById('pothole-bar');
        //$potholeBar.data = p.getData(dimension, year);

        
        d.forEach(dta=>{
          //dta._chart.chart.options = p.getData(dimension).chartOptions;         
          dta._chart.chart.data = p.getData(dimension,dta._model.label).chartData;        
          dta._chart.chart.update({
            duration: 800,
            easing: 'easeOutBounce'
          });
        })
        
      }
      //$potholeBar.updateComponent();
    }


    // Return Monthly Data
    if(dimension == 'mth')
    return {
      chartOptions:{ onClick:()=>{} },
      chartData:{
        labels:['January','February','March','April','May','June','July','August','September','October','November','December'],
        datasets:[{
          label:'2019',
          data:[18000,1900,200000,98000,62000,100].reverse(),
          backgroundColor: '#ca433e'
        },{
          label:'2018',
          data:[351,1935,19480,115,81688,241].reverse(),
          backgroundColor: '#ca433e'
        },{
          label:'2017',
          data:[31,1365,1540,11665,1688,2431].reverse(),
          backgroundColor: '#ca433e'
        },{
          label:'2016',
          data:[311,1963,15948,131,18688,431].reverse(),
          backgroundColor: '#ca433e'
        }].filter(set=>{
         
          if(set.label == year){
            return set;
          }

        })
      }
    }



    // Return Yearly Data
    if(dimension == 'ytd')
    return {
      chartOptions:{ 
        onClick:function(e,d,t){ onClick('mth',e,d,t);}
      },
      chartData:{
        labels:[2019,2018,2017,2016,2015],
        datasets:[{
          label:'Total Potholes Filled',
          data:[196365,159480,131665,181688,291431].reverse(),
          backgroundColor: '#a09e9c'
        }]
      }
    }
  }
}






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


  let $potholeBar = document.getElementById('pothole-bar');
  var phdata = new PotholeData();
  $potholeBar.data = phdata.getData('ytd');








  
  let $potholeFilled = document.getElementById('filled-counts');
  $potholeFilled.style.fontSize = '0.865em';
  let phYTD= phdata.getData('ytd');
  phYTD.chartData.labels.forEach((label,ndx)=>{
    const $card = document.createElement('cotui-chart');
    $card.id = `filled-counts-${label}`;
    $card.setAttribute('chart-type','card');
    $card.setAttribute('chart-title',`${label}`);
    $card.setAttribute('chart-value', phYTD.chartData.datasets[0].data[ndx].toString().formatNumber());
    $card.setAttribute('chart-colour', '#030f29');
    $card.setAttribute('style',`width:${100/(phYTD.chartData.labels.length+1)}%; display:inline-block; margin: 0 5px`);
    $card.caption = "Last Updated";
    //$card.data = phYTD.chartData.datasets[0].data[ndx].toString().formatNumber();
    $potholeFilled.append($card);
  });


  // DataFilters Update Chart Based on function
    var widget = document.getElementById('pothole-bar');
    var $filters = document.getElementById('filter-button');

    $filters.style.display='none';
    [{
      label:'Back',
      func:'ytd'
    }].forEach(btn=>{
      var $btn = document.createElement('button');
      $btn.type = 'button';
      $btn.classList.add('btn');
      $btn.classList.add('btn-default');
      $btn.innerText = btn.label;
      $btn.addEventListener('click',(evt)=>{
        evt.preventDefault();
        widget.data = phdata.getData(btn.func);
        $filters.style.display='none';
        /*
        widget.getPlugin().then(ChartJS=>{
          ChartJS.chart.data = phdata.getData(btn.func).chartData;
          ChartJS.chart.update();
        })
        */
      })
      $filters.append($btn);
    })





});


