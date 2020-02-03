public with sharing class PassParameterActionFunction {
    public String val{get;set;}
    public String enteredText1{get;set;}
    public String enteredText2{get;set;}

    public void echoVal()
    {
     val = 'You have entered : 1 - '+enteredText1+' 2 -'+enteredText2;
    }
}