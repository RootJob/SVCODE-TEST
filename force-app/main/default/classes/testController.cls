public class testController {
    
     @AuraEnabled
     public static string getHeaderFooter()
    {
        List<WrapperHeaderFooter> WrapperHeaderFooterResp ;
        String statusCode ='';
        try{
            
            httprequest request = new httprequest();
            request.setEndpoint('https://www.tagheuer.com/en-us/headerfooter.jsonp');
            request.setMethod('GET');
            request.setTimeout(2000); 
            http http = new http();
            httpresponse RP = http.send(request);
            system.debug('##### Body ' + RP.getBody() + ' StatusCode ' + RP.getStatusCode());
            StatusCode = ''+RP.getStatusCode();
            if(RP.getStatusCode() == 200)
            {
              //  WrapperHeaderFooterResp = (List<WrapperHeaderFooter>)JSON.deserialize(RP.getBody(),List<WrapperHeaderFooter>.class);
              return RP.getBody();  
            }
            return 'WrapperHeaderFooterResp.js' +RP.getStatusCode();
        }
        catch(Exception ex)
        {
            system.debug('#### exception ' + ex.getMessage());
            return ex.getMessage()+'\n'+ex.getCause() + StatusCode;
        }
    }
    public class WrapperHeaderFooter
    {
        @AuraEnabled
        public List<string> css {get;set;}
        @AuraEnabled
        public List<string> js {get;set;}
        @AuraEnabled
        public string header {get;set;}
        @AuraEnabled
        public string footer {get;set;}
    }

}