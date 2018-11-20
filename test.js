function A(e,cb){
    setTimeout(function(){
        console.log(++e)
        cb(e);
    },1000);
}
var e = 10
A(e,function(e){
    if(e>10){
        console.log(e);
    }else{
        console.log(++e);
    }
});