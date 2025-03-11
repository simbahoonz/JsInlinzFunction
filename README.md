# JsInlinzFunction
A function set to make inlinzed function using Javascript native new Function().
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
<tr><td></td><td></td></tr>
</table>


