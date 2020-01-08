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