# JsInlinzFunction
A function set to make inlinzed function using Javascript native new Function().<br>
Normally performance is the main reason of doing this. Inlined function can avoid the function call overload.<br>
<br>
It's pulled from my other libarary of a fast LZW compress/uncompress implementation.
<p>
function <b>parseFuncArgBodyName</b>(<i>func</i>, <i>rep4NotInline</i>)<br>
<table>
  <tr><td><i>func</i></td><td>a javascript function to be parsed as string</td></tr>
  <tr>
  <td><i>rep4NotInline</i></td><td> true - function shall be parsed NOT for the purpose of being inlined<br>
                 false - function shall be parsed FOR to be inserted in other function as inline function</td>
</tr>
  <tr><td>return</td>
    <td>
      [args, body, funcname]<br>
      &nbsp;&nbsp;args - an array of the arg names<br>
      &nbsp;&nbsp;body - the function body<br>
      &nbsp;&nbsp;funcname - the function name, might be empty
  </td></tr>
</table>
<p>
function <b>prepareInline</b>(<i>func</i>, <i>asFuncname</i>)
<table><tr><td>func</td><td>a javascript function to be prepared for </td></tr>
<tr><td>asFuncname</td><td>this param is used to form a RegEx to search for the supposed to be inlined function invokes.</td></tr>
<tr><td>return</td>
  <td>
    [regEx, bodyAssemblingFunction]<br>
    &nbsp;&nbsp;regEx - a RegEx used to search for function calling to this inline function<br>
    &nbsp;&nbsp;bodyAssemblingFunction - a function that put the arguments into the body, to <b>inlinz</b> the function
  </td></tr>
</table>
<p>
function <b>inlinez</b>(<i>mainFuncBody</i>, <i>inlineFuncSet</i>)
<table><tr><td><i>mainFuncBody<i></td>
  <td>the parent function body, normally prepared by calling parseFuncArgBodyName()</td></tr>
  <tr><td><i>inlineFuncSet</i></td><td>An javascript object, each property contains a value from prepareInline(), which is an array of [regEx, bodyAssemblingFunction], property name is not used.</td></tr>
  <tr><td>return</td><td>A string of the result function body, ready to be used in "new Fuction(...args, body)"</td></tr>
</table>

## Usage Example:<br>
bellow function is a function supposed to be inserted into another function as inlined<br>
```
function readBitsDebug(i8buff, posU32, bI8, bits, pos, bi, ch) 
{
    let n = 0, 
        b1bits, b1space, msk, sh = 0;

    if("debug".at(1))
        pos=posU32[0], bi=bI8[0];

    do {
        b1space = 8 - bi;
        if (bits<b1space) {
            b1bits = bits;
            msk = (1 << b1bits) -1;
            n |= ((i8buff[pos] >> bi) & msk) << sh;
            
            bi += bits;

        } else {
            b1bits = b1space;
            msk = (1 << b1bits) -1;
            n |= ((i8buff[pos] >> bi) & msk) << sh;
            
            bi = 0;
            pos++;
        }
        sh += b1bits;
        bits -= b1bits;
    } while (bits);

    if("debug".at(1)){    //this block is for the debug purpose, 
        bI8[0] = bi;      //in this "debug" mode, the function shall be invoked as a function
        posU32[0] = pos;
        return n;    
    }else{                //this block is for inline purpose
        ch = n;           //in this "inline" mode, the function shall be embbeded into another function
        for(;"".at(1);) n|=ch ;     //so that ch = n wont be minified
    }
}
```
The function serves both debugging purpose and running (as being inlined) purpose. That's why the strange "<i>if("debug".at(1))</i>" are there. In the <b>parseFuncArgBodyName</b> function, they will be replace by the 1st block, if function <b>parseFuncArgBodyName</b> is invoked with the second param "rep4NotInline" set to true, or the else block, if function <b>parseFuncArgBodyName</b> is invoked without second param "rep4NotInline".

:eye_speech_bubble: Please be noted: there're no whitespace in:
>  *if("debug".at(1)){*   &nbsp;&nbsp;&nbsp;and&nbsp;&nbsp;&nbsp;  *}else{* 
<p>
The reason of using "if("debug".at(1))" is it won't be minified by most Js minifier. <br>
It's for the same reason, this is there:
> *for(;"".at(1);) n|=ch*

