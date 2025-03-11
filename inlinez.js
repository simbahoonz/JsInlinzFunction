function parseFuncArgBodyName(func, rep4NotInline) { //rep4NotInline
    let s = func.toString(),
        start = s.indexOf("{"),
        funcDef = s.slice(0, start),
        body = s.slice(start + 1, s.lastIndexOf("}")),
        args = funcDef.match(/\((.*?)\)/),
        funcname = funcDef.match(/tion\s*(\w*)\(/);
    
    args = args[1].split(',').map(v=>v.trim());
    funcname = funcname ? funcname[1].trim() : funcname;

    const //if else (group #5)    ?:(group #5)
        regExs = 
        [
            [/for\(([^;]*);"".at\(1\);\)[^;}]*(?=[;}]|$)/g  //replace: for($1;"".at(1););
            , '$1', '$1'
            ]
        ,
            //if("debug".at(1))var e=posU32[0],i=bI8[0];else let e;
            //{}else{}  
            [/(if\("de\w*"\.at\(1\)\)\{)([^\}]*)\}((else\{)([^\{\}]*)\}){0,1}/g
            , '$5', '$2'
            ]
        ,   //{}else;
            [/(if\("de\w*"\.at\(1\)\)\{)([^\}]*)\}((else\b)([^;\{\}]*);|$){0,1}/g
            ,'$5', '$2'
            ]
        ,   // ;else{}
            [/(if\("de\w*"\.at\(1\)\))([^;]*([;}]|$))(else\{([^\{\}]*)\}){0,1}/g
            ,'$5', '$2'
            ]
        ,   // ;else;
            [/(if\("de\w*"\.at\(1\)\))([^;]*([;}]|$))(else\b([^;\{\}]*);|$){0,1}/g
            ,'$5', '$2'
            ]

        /////////"debug".at(1)? :
        ,   // ?:(...)
            [/("de\w*"\.at\(1\))\s*(\?)\s*([^:\{\}]+)\s*(:)\s*(\([^\(\)\{\}]+\))\s*(?=[,\);\}])/g
            ,'$5', '$3'
            ]
        ,   // ?:...
            [/("de\w*"\.at\(1\))\s*(\?)\s*([^:\{\}]+)\s*(:)\s*([^,\(\)\{\}]+)\s*(?=[,;\}\)]|$)/g
            ,'$5', '$3'
            ]
        ,   //()&&()
            [/("de\w*"\.at\(1\))(\&\&)(\([^\(\);]+\))(?=[,;}]|$)/g
            ,'', '$3'
            ]
        ,   //()&& ;}
            [/("de\w*"\.at\(1\))(\&\&)([^\(\),;]+)(?=[,;}\)]|$)/g
            ,'', '$3'
            ]
        ];

    for (let i=0, reg1; i<regExs.length; i++) {
        reg1 = regExs[i];
        body = body.replace(reg1[0], reg1[rep4NotInline ? 2 :1]);
    }

    return [args, body, funcname];
}

function prepareInline(func, asFuncname) {
    let [args, body, funcname] = parseFuncArgBodyName(func);
        body =  body.replace(/\'/g, "\\'")
                    .replace(/\\/g, '\\\\')
                    ;

    //if (funcname.toLowerCase().endsWith('debug'))
    //    funcname = funcname.slice(0, -5);

    function  name2RegEx(arg) {
        if (arg[0]!=='$') arg = '\\b'+arg;
        if (!arg.endsWith('$')) arg += '\\b';   
        arg = arg.replaceAll('$', '\\$');   //$ in RegEx in special, need escape
        return new RegExp(arg, 'g');
    }

    let nArg = ArrLen(args), arg, i;
    for (i=0; i<nArg; i++) {
        body = body.replace(name2RegEx(args[i]), "'+arg["+i+"]+'");
    }

    //rename all local let names, to avoid name conflict
    //!!! do NOT put too complex let in inline function, no embed =,
    //!!! keep as simple as: let a, b, c = (9*a+3);
    const 
        regLet = /let\s*[^;]+;/g;
        
    let localVnames = [],
        matchs = body.match(regLet), 
        n = ArrLen(matchs);
    for(i=0; i<n; i++) {
        let s = matchs[i].slice(3,-1);
        localVnames.push(...s.split(',').map(v=>v.split('=')[0].trim()));
    }

    localVnames.forEach(v=>{    //put "l_" prefix to every local name
        body = body.replace(name2RegEx(v), '_i_'+v);
    });

    body = body.split('\n').map(ln=>"'"+ln+"\\n'+").join('\n');

    return [
            new RegExp('\\b'+asFuncname+'\\((([^\\(\\)]*?)(\\([^\\(\\)]*?\\))*([^\\(\\)]*?))\\)[;\\s]*(\\/\\/.*)*', 'g')
            ,
            new Function('arg', "return "+body+"'';")
           ];
}

function inlinez(mainFuncBody, inlineFuncSet) {
    const 
        inlineFunc = Object.entries(inlineFuncSet);
    
    let regEx, func, args;

    for (let [funcname, regExAndFunc] of Object.entries(inlineFuncSet)) {
        regEx = regExAndFunc[0];
        func = regExAndFunc[1];
        mainFuncBody = mainFuncBody.replace
                                    (   regEx, 
                                        (match, p1)=>
                                            func( 
                                                    p1.split(',').map(v=>'('+v.trim()+')')
                                                )
                                            +';'
                                    );
    }
    return mainFuncBody;
}

function funcNoDebug(func) {
    const
        [args, body, name] = parseFuncArgBodyName(func, 1);

    return new Function(...args, body);
}
