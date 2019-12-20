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
    return fetch(url).then(res=>{return res.json()})
    /*
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
        } else {
          reject( new Error(`Error: No Request (${url})`) )
        }
       
    })
    */
  }