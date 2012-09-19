// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function f(){
    log.history = log.history || [];
    log.history.push(arguments);
    if(this.console) {
        var args = arguments, newarr;
        args.callee = args.callee.caller;
        newarr = [].slice.call(args);
        if (typeof console.log === 'object') log.apply.call(console.log, console, newarr); else console.log.apply(console, newarr);
    }
};

// make it safe to use console.log always
(function(a){
    function b(){}
    for(var c="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,time,timeEnd,trace,warn".split(","),d;!!(d=c.pop());){
        a[d]=a[d]||b;
    }
})
(function(){
    try{
        console.log();
        return window.console;
    }catch(a){
        return (window.console={});
    }
}());


// place any jQuery/helper plugins in here, instead of separate, slower script files.

/*
 * 
 * TableSorter 2.0 - Client-side table sorting with ease!
 * Version 2.0.5b
 * @requires jQuery v1.2.3
 * 
 * Copyright (c) 2007 Christian Bach
 * Examples and docs at: http://tablesorter.com
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 * 
 */
/**
 * 
 * @description Create a sortable table with multi-column sorting capabilitys
 * 
 * @example $('table').tablesorter();
 * @desc Create a simple tablesorter interface.
 * 
 * @example $('table').tablesorter({ sortList:[[0,0],[1,0]] });
 * @desc Create a tablesorter interface and sort on the first and secound column column headers.
 * 
 * @example $('table').tablesorter({ headers: { 0: { sorter: false}, 1: {sorter: false} } });
 *          
 * @desc Create a tablesorter interface and disableing the first and second  column headers.
 *      
 * 
 * @example $('table').tablesorter({ headers: { 0: {sorter:"integer"}, 1: {sorter:"currency"} } });
 * 
 * @desc Create a tablesorter interface and set a column parser for the first
 *       and second column.
 * 
 * 
 * @param Object
 *            settings An object literal containing key/value pairs to provide
 *            optional settings.
 * 
 * 
 * @option String cssHeader (optional) A string of the class name to be appended
 *         to sortable tr elements in the thead of the table. Default value:
 *         "header"
 * 
 * @option String cssAsc (optional) A string of the class name to be appended to
 *         sortable tr elements in the thead on a ascending sort. Default value:
 *         "headerSortUp"
 * 
 * @option String cssDesc (optional) A string of the class name to be appended
 *         to sortable tr elements in the thead on a descending sort. Default
 *         value: "headerSortDown"
 * 
 * @option String sortInitialOrder (optional) A string of the inital sorting
 *         order can be asc or desc. Default value: "asc"
 * 
 * @option String sortMultisortKey (optional) A string of the multi-column sort
 *         key. Default value: "shiftKey"
 * 
 * @option String textExtraction (optional) A string of the text-extraction
 *         method to use. For complex html structures inside td cell set this
 *         option to "complex", on large tables the complex option can be slow.
 *         Default value: "simple"
 * 
 * @option Object headers (optional) An array containing the forces sorting
 *         rules. This option let's you specify a default sorting rule. Default
 *         value: null
 * 
 * @option Array sortList (optional) An array containing the forces sorting
 *         rules. This option let's you specify a default sorting rule. Default
 *         value: null
 * 
 * @option Array sortForce (optional) An array containing forced sorting rules.
 *         This option let's you specify a default sorting rule, which is
 *         prepended to user-selected rules. Default value: null
 * 
 * @option Boolean sortLocaleCompare (optional) Boolean flag indicating whatever
 *         to use String.localeCampare method or not. Default set to true.
 * 
 * 
 * @option Array sortAppend (optional) An array containing forced sorting rules.
 *         This option let's you specify a default sorting rule, which is
 *         appended to user-selected rules. Default value: null
 * 
 * @option Boolean widthFixed (optional) Boolean flag indicating if tablesorter
 *         should apply fixed widths to the table columns. This is usefull when
 *         using the pager companion plugin. This options requires the dimension
 *         jquery plugin. Default value: false
 * 
 * @option Boolean cancelSelection (optional) Boolean flag indicating if
 *         tablesorter should cancel selection of the table headers text.
 *         Default value: true
 * 
 * @option Boolean debug (optional) Boolean flag indicating if tablesorter
 *         should display debuging information usefull for development.
 * 
 * @type jQuery
 * 
 * @name tablesorter
 * 
 * @cat Plugins/Tablesorter
 * 
 * @author Christian Bach/christian.bach@polyester.se
 */

(function($){
    $.extend({
        tablesorter:new
        function(){
            var parsers=[],widgets=[];
            this.defaults={
                cssHeader:"header",
                cssAsc:"headerSortUp",
                cssDesc:"headerSortDown",
                cssChildRow:"expand-child",
                sortInitialOrder:"asc",
                sortMultiSortKey:"shiftKey",
                sortForce:null,
                sortAppend:null,
                sortLocaleCompare:true,
                textExtraction:"simple",
                parsers:{},
                widgets:[],
                widgetZebra:{
                    css:["even","odd"]
                },
                headers:{},
                widthFixed:false,
                cancelSelection:true,
                sortList:[],
                headerList:[],
                dateFormat:"us",
                decimal:'/\.|\,/g',
                onRenderHeader:null,
                selectorHeaders:'thead th',
                debug:false
            };
            
            function benchmark(s,d){
                log(s+","+(new Date().getTime()-d.getTime())+"ms");
            }
            this.benchmark=benchmark;
            function log(s){
                if(typeof console!="undefined"&&typeof console.debug!="undefined"){
                    console.log(s);
                }else{
                    alert(s);
                }
            }
            function buildParserCache(table,$headers){
                if(table.config.debug){
                    var parsersDebug="";
                }
                if(table.tBodies.length==0)return;
                var rows=table.tBodies[0].rows;
                if(rows[0]){
                    var list=[],cells=rows[0].cells,l=cells.length;
                    for(var i=0;i<l;i++){
                        var p=false;
                        if($.metadata&&($($headers[i]).metadata()&&$($headers[i]).metadata().sorter)){
                            p=getParserById($($headers[i]).metadata().sorter);
                        }else if((table.config.headers[i]&&table.config.headers[i].sorter)){
                            p=getParserById(table.config.headers[i].sorter);
                        }
                        if(!p){
                            p=detectParserForColumn(table,rows,-1,i);
                        }
                        if(table.config.debug){
                            parsersDebug+="column:"+i+" parser:"+p.id+"\n";
                        }
                        list.push(p);
                    }
                }
                if(table.config.debug){
                    log(parsersDebug);
                }
                return list;
            };
    
            function detectParserForColumn(table,rows,rowIndex,cellIndex){
                var l=parsers.length,node=false,nodeValue=false,keepLooking=true;
                while(nodeValue==''&&keepLooking){
                    rowIndex++;
                    if(rows[rowIndex]){
                        node=getNodeFromRowAndCellIndex(rows,rowIndex,cellIndex);
                        nodeValue=trimAndGetNodeText(table.config,node);
                        if(table.config.debug){
                            log('Checking if value was empty on row:'+rowIndex);
                        }
                    }else{
                        keepLooking=false;
                    }
                }
                for(var i=1;i<l;i++){
                    if(parsers[i].is(nodeValue,table,node)){
                        return parsers[i];
                    }
                }
                return parsers[0];
            }
            function getNodeFromRowAndCellIndex(rows,rowIndex,cellIndex){
                return rows[rowIndex].cells[cellIndex];
            }
            function trimAndGetNodeText(config,node){
                return $.trim(getElementText(config,node));
            }
            function getParserById(name){
                var l=parsers.length;
                for(var i=0;i<l;i++){
                    if(parsers[i].id.toLowerCase()==name.toLowerCase()){
                        return parsers[i];
                    }
                }
                return false;
            }
            function buildCache(table){
                if(table.config.debug){
                    var cacheTime=new Date();
                }
                var totalRows=(table.tBodies[0]&&table.tBodies[0].rows.length)||0,totalCells=(table.tBodies[0].rows[0]&&table.tBodies[0].rows[0].cells.length)||0,parsers=table.config.parsers,cache={
                    row:[],
                    normalized:[]
                };
    
                for(var i=0;i<totalRows;++i){
                    var c=$(table.tBodies[0].rows[i]),cols=[];
                    if(c.hasClass(table.config.cssChildRow)){
                        cache.row[cache.row.length-1]=cache.row[cache.row.length-1].add(c);
                        continue;
                    }
                    cache.row.push(c);
                    for(var j=0;j<totalCells;++j){
                        cols.push(parsers[j].format(getElementText(table.config,c[0].cells[j]),table,c[0].cells[j]));
                    }
                    cols.push(cache.normalized.length);
                    cache.normalized.push(cols);
                    cols=null;
                };
    
                if(table.config.debug){
                    benchmark("Building cache for "+totalRows+" rows:",cacheTime);
                }
                return cache;
            };

            function getElementText(config,node){
                var text="";
                if(!node)return"";
                if(!config.supportsTextContent)config.supportsTextContent=node.textContent||false;
                if(config.textExtraction=="simple"){
                    if(config.supportsTextContent){
                        text=node.textContent;
                    }else{
                        if(node.childNodes[0]&&node.childNodes[0].hasChildNodes()){
                            text=node.childNodes[0].innerHTML;
                        }else{
                            text=node.innerHTML;
                        }
                    }
                }else{
                    if(typeof(config.textExtraction)=="function"){
                        text=config.textExtraction(node);
                    }else{
                        text=$(node).text();
                    }
                }
                return text;
            }
            function appendToTable(table,cache){
                if(table.config.debug){
                    var appendTime=new Date()
                }
                var c=cache,r=c.row,n=c.normalized,totalRows=n.length,checkCell=(n[0].length-1),tableBody=$(table.tBodies[0]),rows=[];
                for(var i=0;i<totalRows;i++){
                    var pos=n[i][checkCell];
                    rows.push(r[pos]);
                    if(!table.config.appender){
                        var l=r[pos].length;
                        for(var j=0;j<l;j++){
                            tableBody[0].appendChild(r[pos][j]);
                        }
                    }
                }
                if(table.config.appender){
                    table.config.appender(table,rows);
                }
                rows=null;
                if(table.config.debug){
                    benchmark("Rebuilt table:",appendTime);
                }
                applyWidget(table);
                setTimeout(function(){
                    $(table).trigger("sortEnd");
                },0);
            };

            function buildHeaders(table){
                if(table.config.debug){
                    var time=new Date();
                }
                var meta=($.metadata)?true:false;
                var header_index=computeTableHeaderCellIndexes(table);
                $tableHeaders=$(table.config.selectorHeaders,table).each(function(index){
                    this.column=header_index[this.parentNode.rowIndex+"-"+this.cellIndex];
                    this.order=formatSortingOrder(table.config.sortInitialOrder);
                    this.count=this.order;
                    if(checkHeaderMetadata(this)||checkHeaderOptions(table,index))this.sortDisabled=true;
                    if(checkHeaderOptionsSortingLocked(table,index))this.order=this.lockedOrder=checkHeaderOptionsSortingLocked(table,index);
                    if(!this.sortDisabled){
                        var $th=$(this).addClass(table.config.cssHeader);
                        if(table.config.onRenderHeader)table.config.onRenderHeader.apply($th);
                    }
                    table.config.headerList[index]=this;
                });
                if(table.config.debug){
                    benchmark("Built headers:",time);
                    log($tableHeaders);
                }
                return $tableHeaders;
            };

            function computeTableHeaderCellIndexes(t){
                var matrix=[];
                var lookup={};
    
                var thead=t.getElementsByTagName('THEAD')[0];
                var trs=thead.getElementsByTagName('TR');
                for(var i=0;i<trs.length;i++){
                    var cells=trs[i].cells;
                    for(var j=0;j<cells.length;j++){
                        var c=cells[j];
                        var rowIndex=c.parentNode.rowIndex;
                        var cellId=rowIndex+"-"+c.cellIndex;
                        var rowSpan=c.rowSpan||1;
                        var colSpan=c.colSpan||1
                        var firstAvailCol;
                        if(typeof(matrix[rowIndex])=="undefined"){
                            matrix[rowIndex]=[];
                        }
                        for(var k=0;k<matrix[rowIndex].length+1;k++){
                            if(typeof(matrix[rowIndex][k])=="undefined"){
                                firstAvailCol=k;
                                break;
                            }
                        }
                        lookup[cellId]=firstAvailCol;
                        for(var k=rowIndex;k<rowIndex+rowSpan;k++){
                            if(typeof(matrix[k])=="undefined"){
                                matrix[k]=[];
                            }
                            var matrixrow=matrix[k];
                            for(var l=firstAvailCol;l<firstAvailCol+colSpan;l++){
                                matrixrow[l]="x";
                            }
                        }
                    }
                }
                return lookup;
            }
            function checkCellColSpan(table,rows,row){
                var arr=[],r=table.tHead.rows,c=r[row].cells;
                for(var i=0;i<c.length;i++){
                    var cell=c[i];
                    if(cell.colSpan>1){
                        arr=arr.concat(checkCellColSpan(table,headerArr,row++));
                    }else{
                        if(table.tHead.length==1||(cell.rowSpan>1||!r[row+1])){
                            arr.push(cell);
                        }
                    }
                }
                return arr;
            };

            function checkHeaderMetadata(cell){
                if(($.metadata)&&($(cell).metadata().sorter===false)){
                    return true;
                };
    
                return false;
            }
            function checkHeaderOptions(table,i){
                if((table.config.headers[i])&&(table.config.headers[i].sorter===false)){
                    return true;
                };
    
                return false;
            }
            function checkHeaderOptionsSortingLocked(table,i){
                if((table.config.headers[i])&&(table.config.headers[i].lockedOrder))return table.config.headers[i].lockedOrder;
                return false;
            }
            function applyWidget(table){
                var c=table.config.widgets;
                var l=c.length;
                for(var i=0;i<l;i++){
                    getWidgetById(c[i]).format(table);
                }
            }
            function getWidgetById(name){
                var l=widgets.length;
                for(var i=0;i<l;i++){
                    if(widgets[i].id.toLowerCase()==name.toLowerCase()){
                        return widgets[i];
                    }
                }
            };

            function formatSortingOrder(v){
                if(typeof(v)!="Number"){
                    return(v.toLowerCase()=="desc")?1:0;
                }else{
                    return(v==1)?1:0;
                }
            }
            function isValueInArray(v,a){
                var l=a.length;
                for(var i=0;i<l;i++){
                    if(a[i][0]==v){
                        return true;
                    }
                }
                return false;
            }
            function setHeadersCss(table,$headers,list,css){
                $headers.removeClass(css[0]).removeClass(css[1]);
                var h=[];
                $headers.each(function(offset){
                    if(!this.sortDisabled){
                        h[this.column]=$(this);
                    }
                });
                var l=list.length;
                for(var i=0;i<l;i++){
                    h[list[i][0]].addClass(css[list[i][1]]);
                }
            }
            function fixColumnWidth(table,$headers){
                var c=table.config;
                if(c.widthFixed){
                    var colgroup=$('<colgroup>');
                    $("tr:first td",table.tBodies[0]).each(function(){
                        colgroup.append($('<col>').css('width',$(this).width()));
                    });
                    $(table).prepend(colgroup);
                };

            }
            function updateHeaderSortCount(table,sortList){
                var c=table.config,l=sortList.length;
                for(var i=0;i<l;i++){
                    var s=sortList[i],o=c.headerList[s[0]];
                    o.count=s[1];
                    o.count++;
                }
            }
            function multisort(table,sortList,cache){
                if(table.config.debug){
                    var sortTime=new Date();
                }
                var dynamicExp="var sortWrapper = function(a,b) {",l=sortList.length;
                for(var i=0;i<l;i++){
                    var c=sortList[i][0];
                    var order=sortList[i][1];
                    var s=(table.config.parsers[c].type=="text")?((order==0)?makeSortFunction("text","asc",c):makeSortFunction("text","desc",c)):((order==0)?makeSortFunction("numeric","asc",c):makeSortFunction("numeric","desc",c));
                    var e="e"+i;
                    dynamicExp+="var "+e+" = "+s;
                    dynamicExp+="if("+e+") { return "+e+"; } ";
                    dynamicExp+="else { ";
                }
                var orgOrderCol=cache.normalized[0].length-1;
                dynamicExp+="return a["+orgOrderCol+"]-b["+orgOrderCol+"];";
                for(var i=0;i<l;i++){
                    dynamicExp+="}; ";
                }
                dynamicExp+="return 0; ";
                dynamicExp+="}; ";
                if(table.config.debug){
                    benchmark("Evaling expression:"+dynamicExp,new Date());
                }
                eval(dynamicExp);
                cache.normalized.sort(sortWrapper);
                if(table.config.debug){
                    benchmark("Sorting on "+sortList.toString()+" and dir "+order+" time:",sortTime);
                }
                return cache;
            };

            function makeSortFunction(type,direction,index){
                var a="a["+index+"]",b="b["+index+"]";
                if(type=='text'&&direction=='asc'){
                    return"("+a+" == "+b+" ? 0 : ("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : ("+a+" < "+b+") ? -1 : 1 )));";
                }else if(type=='text'&&direction=='desc'){
                    return"("+a+" == "+b+" ? 0 : ("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : ("+b+" < "+a+") ? -1 : 1 )));";
                }else if(type=='numeric'&&direction=='asc'){
                    return"("+a+" === null && "+b+" === null) ? 0 :("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : "+a+" - "+b+"));";
                }else if(type=='numeric'&&direction=='desc'){
                    return"("+a+" === null && "+b+" === null) ? 0 :("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : "+b+" - "+a+"));";
                }
            };

            function makeSortText(i){
                return"((a["+i+"] < b["+i+"]) ? -1 : ((a["+i+"] > b["+i+"]) ? 1 : 0));";
            };

            function makeSortTextDesc(i){
                return"((b["+i+"] < a["+i+"]) ? -1 : ((b["+i+"] > a["+i+"]) ? 1 : 0));";
            };

            function makeSortNumeric(i){
                return"a["+i+"]-b["+i+"];";
            };

            function makeSortNumericDesc(i){
                return"b["+i+"]-a["+i+"];";
            };

            function sortText(a,b){
                if(table.config.sortLocaleCompare)return a.localeCompare(b);
                return((a<b)?-1:((a>b)?1:0));
            };

            function sortTextDesc(a,b){
                if(table.config.sortLocaleCompare)return b.localeCompare(a);
                return((b<a)?-1:((b>a)?1:0));
            };

            function sortNumeric(a,b){
                return a-b;
            };

            function sortNumericDesc(a,b){
                return b-a;
            };

            function getCachedSortType(parsers,i){
                return parsers[i].type;
            };

            this.construct=function(settings){
                return this.each(function(){
                    if(!this.tHead||!this.tBodies)return;
                    var $this,$document,$headers,cache,config,shiftDown=0,sortOrder;
                    this.config={};
        
                    config=$.extend(this.config,$.tablesorter.defaults,settings);
                    $this=$(this);
                    $.data(this,"tablesorter",config);
                    $headers=buildHeaders(this);
                    this.config.parsers=buildParserCache(this,$headers);
                    cache=buildCache(this);
                    var sortCSS=[config.cssDesc,config.cssAsc];
                    fixColumnWidth(this);
                    $headers.click(function(e){
                        var totalRows=($this[0].tBodies[0]&&$this[0].tBodies[0].rows.length)||0;
                        if(!this.sortDisabled&&totalRows>0){
                            $this.trigger("sortStart");
                            var $cell=$(this);
                            var i=this.column;
                            this.order=this.count++%2;
                            if(this.lockedOrder)this.order=this.lockedOrder;
                            if(!e[config.sortMultiSortKey]){
                                config.sortList=[];
                                if(config.sortForce!=null){
                                    var a=config.sortForce;
                                    for(var j=0;j<a.length;j++){
                                        if(a[j][0]!=i){
                                            config.sortList.push(a[j]);
                                        }
                                    }
                                }
                                config.sortList.push([i,this.order]);
                            }else{
                                if(isValueInArray(i,config.sortList)){
                                    for(var j=0;j<config.sortList.length;j++){
                                        var s=config.sortList[j],o=config.headerList[s[0]];
                                        if(s[0]==i){
                                            o.count=s[1];
                                            o.count++;
                                            s[1]=o.count%2;
                                        }
                                    }
                                }else{
                                    config.sortList.push([i,this.order]);
                                }
                            };
    
                            setTimeout(function(){
                                setHeadersCss($this[0],$headers,config.sortList,sortCSS);
                                appendToTable($this[0],multisort($this[0],config.sortList,cache));
                            },1);
                            return false;
                        }
                    }).mousedown(function(){
                        if(config.cancelSelection){
                            this.onselectstart=function(){
                                return false
                            };
            
                            return false;
                        }
                    });
                    $this.bind("update",function(){
                        var me=this;
                        setTimeout(function(){
                            me.config.parsers=buildParserCache(me,$headers);
                            cache=buildCache(me);
                        },1);
                    }).bind("updateCell",function(e,cell){
                        var config=this.config;
                        var pos=[(cell.parentNode.rowIndex-1),cell.cellIndex];
                        cache.normalized[pos[0]][pos[1]]=config.parsers[pos[1]].format(getElementText(config,cell),cell);
                    }).bind("sorton",function(e,list){
                        $(this).trigger("sortStart");
                        config.sortList=list;
                        var sortList=config.sortList;
                        updateHeaderSortCount(this,sortList);
                        setHeadersCss(this,$headers,sortList,sortCSS);
                        appendToTable(this,multisort(this,sortList,cache));
                    }).bind("appendCache",function(){
                        appendToTable(this,cache);
                    }).bind("applyWidgetId",function(e,id){
                        getWidgetById(id).format(this);
                    }).bind("applyWidgets",function(){
                        applyWidget(this);
                    });
                    if($.metadata&&($(this).metadata()&&$(this).metadata().sortlist)){
                        config.sortList=$(this).metadata().sortlist;
                    }
                    if(config.sortList.length>0){
                        $this.trigger("sorton",[config.sortList]);
                    }
                    applyWidget(this);
                });
            };

            this.addParser=function(parser){
                var l=parsers.length,a=true;
                for(var i=0;i<l;i++){
                    if(parsers[i].id.toLowerCase()==parser.id.toLowerCase()){
                        a=false;
                    }
                }
                if(a){
                    parsers.push(parser);
                };

            };

            this.addWidget=function(widget){
                widgets.push(widget);
            };

            this.formatFloat=function(s){
                var i=parseFloat(s);
                return(isNaN(i))?0:i;
            };

            this.formatInt=function(s){
                var i=parseInt(s);
                return(isNaN(i))?0:i;
            };

            this.isDigit=function(s,config){
                return/^[-+]?\d*$/.test($.trim(s.replace(/[,.']/g,'')));
            };

            this.clearTableBody=function(table){
                if($.browser.msie){
                    function empty(){
                        while(this.firstChild)this.removeChild(this.firstChild);
                    }
                    empty.apply(table.tBodies[0]);
                }else{
                    table.tBodies[0].innerHTML="";
                }
            };

        }
    });
    $.fn.extend({
        tablesorter:$.tablesorter.construct
    });
    var ts=$.tablesorter;
    ts.addParser({
        id:"text",
        is:function(s){
            return true;
        },
        format:function(s){
            return $.trim(s.toLocaleLowerCase());
        },
        type:"text"
    });
    ts.addParser({
        id:"digit",
        is:function(s,table){
            var c=table.config;
            return $.tablesorter.isDigit(s,c);
        },
        format:function(s){
            return $.tablesorter.formatFloat(s);
        },
        type:"numeric"
    });
    ts.addParser({
        id:"currency",
        is:function(s){
            return/^[Â£$â‚¬?.]/.test(s);
        },
        format:function(s){
            return $.tablesorter.formatFloat(s.replace(new RegExp(/[Â£$â‚¬]/g),""));
        },
        type:"numeric"
    });
    ts.addParser({
        id:"ipAddress",
        is:function(s){
            return/^\d{2,3}[\.]\d{2,3}[\.]\d{2,3}[\.]\d{2,3}$/.test(s);
        },
        format:function(s){
            var a=s.split("."),r="",l=a.length;
            for(var i=0;i<l;i++){
                var item=a[i];
                if(item.length==2){
                    r+="0"+item;
                }else{
                    r+=item;
                }
            }
            return $.tablesorter.formatFloat(r);
        },
        type:"numeric"
    });
    ts.addParser({
        id:"url",
        is:function(s){
            return/^(https?|ftp|file):\/\/$/.test(s);
        },
        format:function(s){
            return jQuery.trim(s.replace(new RegExp(/(https?|ftp|file):\/\//),''));
        },
        type:"text"
    });
    ts.addParser({
        id:"isoDate",
        is:function(s){
            return/^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(s);
        },
        format:function(s){
            return $.tablesorter.formatFloat((s!="")?new Date(s.replace(new RegExp(/-/g),"/")).getTime():"0");
        },
        type:"numeric"
    });
    ts.addParser({
        id:"percent",
        is:function(s){
            return/\%$/.test($.trim(s));
        },
        format:function(s){
            return $.tablesorter.formatFloat(s.replace(new RegExp(/%/g),""));
        },
        type:"numeric"
    });
    ts.addParser({
        id:"usLongDate",
        is:function(s){
            return s.match(new RegExp(/^[A-Za-z]{3,10}\.? [0-9]{1,2}, ([0-9]{4}|'?[0-9]{2}) (([0-2]?[0-9]:[0-5][0-9])|([0-1]?[0-9]:[0-5][0-9]\s(AM|PM)))$/));
        },
        format:function(s){
            return $.tablesorter.formatFloat(new Date(s).getTime());
        },
        type:"numeric"
    });
    ts.addParser({
        id:"shortDate",
        is:function(s){
            return/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(s);
        },
        format:function(s,table){
            var c=table.config;
            s=s.replace(/\-/g,"/");
            if(c.dateFormat=="us"){
                s=s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,"$3/$1/$2");
            }else if(c.dateFormat=="uk"){
                s=s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,"$3/$2/$1");
            }else if(c.dateFormat=="dd/mm/yy"||c.dateFormat=="dd-mm-yy"){
                s=s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})/,"$1/$2/$3");
            }
            return $.tablesorter.formatFloat(new Date(s).getTime());
        },
        type:"numeric"
    });
    ts.addParser({
        id:"time",
        is:function(s){
            return/^(([0-2]?[0-9]:[0-5][0-9])|([0-1]?[0-9]:[0-5][0-9]\s(am|pm)))$/.test(s);
        },
        format:function(s){
            return $.tablesorter.formatFloat(new Date("2000/01/01 "+s).getTime());
        },
        type:"numeric"
    });
    ts.addParser({
        id:"metadata",
        is:function(s){
            return false;
        },
        format:function(s,table,cell){
            var c=table.config,p=(!c.parserMetadataName)?'sortValue':c.parserMetadataName;
            return $(cell).metadata()[p];
        },
        type:"numeric"
    });
    ts.addWidget({
        id:"zebra",
        format:function(table){
            if(table.config.debug){
                var time=new Date();
            }
            var $tr,row=-1,odd;
            $("tr:visible",table.tBodies[0]).each(function(i){
                $tr=$(this);
                if(!$tr.hasClass(table.config.cssChildRow))row++;
                odd=(row%2==0);
                $tr.removeClass(table.config.widgetZebra.css[odd?0:1]).addClass(table.config.widgetZebra.css[odd?1:0])
            });
            if(table.config.debug){
                $.tablesorter.benchmark("Applying Zebra widget",time);
            }
        }
    });
})(jQuery);

/*
 Inspired by the lightbox plugin adapted to jquery by Leandro Vieira Pinho (http://leandrovieira.com)
 
 @author  : Nicolas Turlais : nicolas-at-insipi.de
 @version : V0.3 - January 2012
 @license : Licensed under CCAttribution-ShareAlike
 @website : http://chocolat.insipi.de
 
*/
(function($) {
    images = new Array();
    var calls = 0;
    $.fn.Chocolat = function(settings) {
        settings = $.extend({
            container:					$('body'),
            displayAsALink:				false,
            linkImages:					true,
            linksContainer:				'Choco_links_container',				
            overlayOpacity:				0.9,
            overlayColor:				'#fff',
            fadeInOverlayduration:		500,
            fadeInImageduration:		500,
            fadeOutImageduration:		500,
            vache:						true,					
            separator1:					' | ',						
            separator2:					'/',						
            leftImg:					'img/chocolat/left.gif',	
            rightImg:					'img/chocolat/right.gif',	
            closeImg:					'img/chocolat/close.gif',		
            loadingImg:					'img/chocolat/loading.gif',		
            currentImage:				0,						
            setIndex:					0,
            setTitle:					'',
            lastImage:					0
        },settings);
		
        calls++;
        settings.setIndex = calls;
        images[settings.setIndex] = new Array();
		
        //images:
        this.each(function(index){
			
            if(index == 0 && settings.linkImages){
                if(settings.setTitle == ''){
                    settings.setTitle = isSet($(this).attr('rel'), ' ');
                }
            }
            $(this).each(function() {
                images[settings.setIndex]['displayAsALink'] = settings.displayAsALink;
                images[settings.setIndex][index] = new Array();
                images[settings.setIndex][index]['adress'] = isSet($(this).attr('href'), ' ');
                images[settings.setIndex][index]['caption'] = isSet($(this).attr('title'), ' ');
                if(!settings.displayAsALink){
                    $(this).unbind('click').bind('click', {
                        id: settings.setIndex, 
                        nom : settings.setTitle, 
                        i : index
                    }, _initialise);
                }
            })

        });
		
        //setIndex:
        for(var i = 0; i < images[settings.setIndex].length; i++)
        {
            if(images[settings.setIndex]['displayAsALink']){
                if($('#'+settings.linksContainer).size() == 0){
                    this.filter(":first").before('<ul id="'+settings.linksContainer+'"></ul>');
                }
                $('#'+settings.linksContainer).append('<li><a href="#" id="Choco_numsetIndex_'+settings.setIndex+'" class="Choco_link">'+settings.setTitle+'</a></li>');
                e = this.parent();
                $(this).remove();
                if($.trim(e.html()) == ""){//If parent empty : remove it
                    e.remove();
                }
                return $('#Choco_numsetIndex_'+settings.setIndex).unbind('click').bind('click', {
                    id: settings.setIndex, 
                    nom : settings.setTitle, 
                    i : settings.currentImage
                }, _initialise);
            }
        }
		
        function _initialise(event) {
			
            settings.currentImage = event.data.i;
            settings.setIndex = event.data.id;
            settings.setTitle = event.data.nom;
            settings.lastImage = images[settings.setIndex].length - 1;
            showChocolat();
            return false;
        }
        function _interface(){
            //html
            clear();
            settings.container.append('<div id="Choco_overlay"></div><div id="Choco_content"><div id="Choco_close"></div><div id="Choco_loading"></div><div id="Choco_container_photo"><img id="Choco_bigImage" src="" /></div><div id="Choco_container_description"><span id="Choco_container_title"></span><span id="Choco_container_via"></span></div><div id="Choco_left_arrow" class="Choco_arrows"></div><div id="Choco_right_arrow" class="Choco_arrows"></div></div>');	
            $('#Choco_left_arrow').css('background-image', 'url('+settings.leftImg+')');  
            $('#Choco_right_arrow').css('background-image', 'url('+settings.rightImg+')');  
            $('#Choco_close').css('background-image', 'url('+settings.closeImg+')'); 
            $('#Choco_loading').css('background-image', 'url('+settings.loadingImg+')'); 
            if(settings.container.get(0).nodeName.toLowerCase() !== 'body'){
                settings.container.css({
                    'position':'relative',
                    'overflow':'hidden',
                    'line-height':'normal'
                });//yes, yes
                $('#Choco_content').css('position','relative');
                $('#Choco_overlay').css('position', 'absolute');
            }
            //events
            $(document).unbind('keydown').bind('keydown', function(e){
                switch(e.keyCode){
                    case 37:
                        changePageChocolat(-1);
                        break;
                    case 39:
                        changePageChocolat(1);
                        break;
                    case 27:
                        close();
                        break;
                };
            });
            if(settings.vache){
                $('#Choco_overlay').click(function(){
                    close();
                    return false;
                });
            }
            $('#Choco_left_arrow').unbind('click').bind('click', function(){
                changePageChocolat(-1);
                return false;
            });
            $('#Choco_right_arrow').unbind('click').bind('click', function(){
                changePageChocolat(1);
                return false;
            });
            $('#Choco_close').unbind('click').bind('click', function(){
                close();
                return false;
            });
            $(window).resize(function() {
                load(settings.currentImage,true);
            });
	
        }
        function showChocolat(){	
            _interface();
            load(settings.currentImage, false);
            $('#Choco_overlay').css({
                'background-color' : settings.overlayColor, 
                'opacity' : settings.overlayOpacity
            }).fadeIn(settings.fadeInOverlayduration);
            $('#Choco_content').fadeIn(settings.fadeInImageduration,function(){});
			
        }
        function load(image,resize){
            settings.currentImage = image;
            $('#Choco_loading').fadeIn(settings.fadeInImageduration);
            var imgPreloader = new Image();
            imgPreloader.onload = function(){
                $('#Choco_bigImage').attr('src',images[settings.setIndex][settings.currentImage]['adress']);
                var ajustees = iWantThePerfectImageSize(imgPreloader.height,imgPreloader.width);
                ChoColat(ajustees['hauteur'],ajustees['largeur'],resize);
                $('#Choco_loading').stop().fadeOut(settings.fadeOutImageduration);
            };
            imgPreloader.src = images[settings.setIndex][settings.currentImage]['adress'];
            preload();
            upadteDescription();
        }
        function changePageChocolat(signe){
            if(!settings.linkImages)
            {
                return false;
            }
            else if(settings.currentImage == 0 && signe == -1)
            {
                return false;
            }
            else if(settings.currentImage == settings.lastImage && signe == 1){
                return false;
            }
            else{

                $('#Choco_container_description').fadeTo(settings.fadeOutImageduration,0);
                $('#Choco_bigImage').fadeTo(settings.fadeOutImageduration, 0, function(){
                    load(settings.currentImage + parseInt(signe), false);
                });

            }
        }
        function ChoColat(hauteur_image,largeur_image,resize){

            if(resize){
                $('#Choco_container_photo, #Choco_content, #Choco_bigImage').stop(true,false).css({
                    'overflow':'visible'
                });
                $('#Choco_bigImage').animate({
                    'height' : hauteur_image+'px',
                    'width' : largeur_image+'px',
                },settings.fadeInImageduration);
            }
            $('#Choco_container_photo').animate({
                'height' : hauteur_image,
                'width' : largeur_image
            },settings.fadeInImageduration);
            $('#Choco_content').animate({
                'height' : hauteur_image,
                'width' : largeur_image,
                'marginLeft' : -largeur_image/2,
                'marginTop' : -(hauteur_image)/2
            },settings.fadeInImageduration, 'swing', function(){
                $('#Choco_bigImage').fadeTo(settings.fadeInImageduration, 1).height(hauteur_image).width(largeur_image).fadeIn(settings.fadeInImageduration);
                if(!resize)
                {
                    arrowsManaging();
                    $('#Choco_container_description').fadeTo(settings.fadeInImageduration,1);
                    $('#Choco_close').fadeIn(settings.fadeInImageduration);
                }
            }).
            css('overflow', 'visible');
        }
        function arrowsManaging(){
            if(settings.linkImages){
                var what = new Array('Choco_right_arrow','Choco_left_arrow');
                for(var i=0; i < what.length; i++){
                    hide = false;
                    if(what[i] == 'Choco_right_arrow' && settings.currentImage == settings.lastImage){
                        hide = true;
                        $('#'+what[i]).fadeOut(300);
                    }
                    else if(what[i] == 'Choco_left_arrow' && settings.currentImage == 0){
                        hide = true;
                        $('#'+what[i]).fadeOut(300);
                    }
                    if(!hide){
                        $('#'+what[i]).fadeIn(settings.fadeOutImageduration);
                    }
                }
            }
        }
        function preload(){
            if(settings.currentImage !== settings.lastImage){
                i = new Image;
                z = settings.currentImage + 1;
                i.src = images[settings.setIndex][z]['adress'];
            }
        }
        function upadteDescription(){
            var current = settings.currentImage + 1;
            var last = settings.lastImage + 1;
            $('#Choco_container_title').html(images[settings.setIndex][settings.currentImage]['caption']);
            $('#Choco_container_via').html(settings.setTitle+settings.separator1+current +settings.separator2+last);
        }
        function isSet(variable,defaultValue){
            if (variable === undefined) {
                return defaultValue;
            }
            else{
                return variable;
            }
        }
        function iWantThePerfectImageSize(himg,limg){
            //28% = 14% + 14% margin
            //51px height of description + close
            var lblock = limg + (limg*28/100);
            var hblock = himg + 51;
            var k = limg/himg;
            var kk = himg/limg;
            if(settings.container.get(0).nodeName.toLowerCase() == 'body'){
                windowHeight = $(window).height();
                windowWidth = $(window).width();
            }
            else{
                windowHeight = settings.container.height();
                windowWidth = settings.container.width();
            }
            notFitting = true;
            while (notFitting){
                var lblock = limg + (limg*28/100);
                var hblock = himg + 51;
                if(lblock > windowWidth){
                    limg = windowWidth*100/128;
						
                    himg = kk * limg;
                }else if(hblock > windowHeight){
                    himg = (windowHeight - 51);
                    limg = k * himg;
                }else{
                    notFitting = false;
                };
            };
            return {
                largeur:limg,
                hauteur:himg
            };

        }
        function clear(){
            $('#Choco_overlay').remove()
            $('#Choco_content').remove()
        }
        function close(){
            $('#Choco_overlay').fadeOut(900, function(){
                $('#Choco_overlay').remove()
            });
            $('#Choco_content').fadeOut(500, function(){
                $('#Choco_content').remove()
            });
            settings.currentImage = 0;
        }
	
    };
})(jQuery);

/**
 *
 * Color picker
 * Author: Stefan Petre www.eyecon.ro
 * 
 * Dual licensed under the MIT and GPL licenses
 * 
 */
//(function ($) {
var ColorPicker = function () {
    var
    ids = {},
    inAction,
    charMin = 65,
    visible,
    tpl = '<div class="colorpicker"><div class="colorpicker_color"><div><div></div></div></div><div class="colorpicker_hue"><div></div></div><div class="colorpicker_new_color"></div><div class="colorpicker_current_color"></div><div class="colorpicker_hex"><input type="text" maxlength="6" size="6" /></div><div class="colorpicker_rgb_r colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_rgb_g colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_rgb_b colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_hsb_h colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_hsb_s colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_hsb_b colorpicker_field"><input type="text" maxlength="3" size="3" /><span></span></div><div class="colorpicker_submit"></div></div>',
    defaults = {
        eventName: 'click',
        onShow: function () {},
        onBeforeShow: function(){},
        onHide: function () {},
        onChange: function () {},
        onSubmit: function () {},
        color: 'ff0000',
        livePreview: true,
        flat: false
    },
    fillRGBFields = function  (hsb, cal) {
        var rgb = HSBToRGB(hsb);
        $(cal).data('colorpicker').fields
        .eq(1).val(rgb.r).end()
        .eq(2).val(rgb.g).end()
        .eq(3).val(rgb.b).end();
    },
    fillHSBFields = function  (hsb, cal) {
        $(cal).data('colorpicker').fields
        .eq(4).val(hsb.h).end()
        .eq(5).val(hsb.s).end()
        .eq(6).val(hsb.b).end();
    },
    fillHexFields = function (hsb, cal) {
        $(cal).data('colorpicker').fields
        .eq(0).val(HSBToHex(hsb)).end();
    },
    setSelector = function (hsb, cal) {
        $(cal).data('colorpicker').selector.css('backgroundColor', '#' + HSBToHex({
            h: hsb.h, 
            s: 100, 
            b: 100
        }));
        $(cal).data('colorpicker').selectorIndic.css({
            left: parseInt(150 * hsb.s/100, 10),
            top: parseInt(150 * (100-hsb.b)/100, 10)
        });
    },
    setHue = function (hsb, cal) {
        $(cal).data('colorpicker').hue.css('top', parseInt(150 - 150 * hsb.h/360, 10));
    },
    setCurrentColor = function (hsb, cal) {
        $(cal).data('colorpicker').currentColor.css('backgroundColor', '#' + HSBToHex(hsb));
    },
    setNewColor = function (hsb, cal) {
        $(cal).data('colorpicker').newColor.css('backgroundColor', '#' + HSBToHex(hsb));
    },
    keyDown = function (ev) {
        var pressedKey = ev.charCode || ev.keyCode || -1;
        if ((pressedKey > charMin && pressedKey <= 90) || pressedKey == 32) {
            return false;
        }
        var cal = $(this).parent().parent();
        if (cal.data('colorpicker').livePreview === true) {
            change.apply(this);
        }
    },
    change = function (ev) {
        var cal = $(this).parent().parent(), col;
        if (this.parentNode.className.indexOf('_hex') > 0) {
            cal.data('colorpicker').color = col = HexToHSB(fixHex(this.value));
        } else if (this.parentNode.className.indexOf('_hsb') > 0) {
            cal.data('colorpicker').color = col = fixHSB({
                h: parseInt(cal.data('colorpicker').fields.eq(4).val(), 10),
                s: parseInt(cal.data('colorpicker').fields.eq(5).val(), 10),
                b: parseInt(cal.data('colorpicker').fields.eq(6).val(), 10)
            });
        } else {
            cal.data('colorpicker').color = col = RGBToHSB(fixRGB({
                r: parseInt(cal.data('colorpicker').fields.eq(1).val(), 10),
                g: parseInt(cal.data('colorpicker').fields.eq(2).val(), 10),
                b: parseInt(cal.data('colorpicker').fields.eq(3).val(), 10)
            }));
        }
        if (ev) {
            fillRGBFields(col, cal.get(0));
            fillHexFields(col, cal.get(0));
            fillHSBFields(col, cal.get(0));
        }
        setSelector(col, cal.get(0));
        setHue(col, cal.get(0));
        setNewColor(col, cal.get(0));
        cal.data('colorpicker').onChange.apply(cal, [col, HSBToHex(col), HSBToRGB(col)]);
    },
    blur = function (ev) {
        var cal = $(this).parent().parent();
        cal.data('colorpicker').fields.parent().removeClass('colorpicker_focus');
    },
    focus = function () {
        charMin = this.parentNode.className.indexOf('_hex') > 0 ? 70 : 65;
        $(this).parent().parent().data('colorpicker').fields.parent().removeClass('colorpicker_focus');
        $(this).parent().addClass('colorpicker_focus');
    },
    downIncrement = function (ev) {
        var field = $(this).parent().find('input').focus();
        var current = {
            el: $(this).parent().addClass('colorpicker_slider'),
            max: this.parentNode.className.indexOf('_hsb_h') > 0 ? 360 : (this.parentNode.className.indexOf('_hsb') > 0 ? 100 : 255),
            y: ev.pageY,
            field: field,
            val: parseInt(field.val(), 10),
            preview: $(this).parent().parent().data('colorpicker').livePreview					
        };
        $(document).bind('mouseup', current, upIncrement);
        $(document).bind('mousemove', current, moveIncrement);
    },
    moveIncrement = function (ev) {
        ev.data.field.val(Math.max(0, Math.min(ev.data.max, parseInt(ev.data.val + ev.pageY - ev.data.y, 10))));
        if (ev.data.preview) {
            change.apply(ev.data.field.get(0), [true]);
        }
        return false;
    },
    upIncrement = function (ev) {
        change.apply(ev.data.field.get(0), [true]);
        ev.data.el.removeClass('colorpicker_slider').find('input').focus();
        $(document).unbind('mouseup', upIncrement);
        $(document).unbind('mousemove', moveIncrement);
        return false;
    },
    downHue = function (ev) {
        var current = {
            cal: $(this).parent(),
            y: $(this).offset().top
        };
        current.preview = current.cal.data('colorpicker').livePreview;
        $(document).bind('mouseup', current, upHue);
        $(document).bind('mousemove', current, moveHue);
    },
    moveHue = function (ev) {
        change.apply(
            ev.data.cal.data('colorpicker')
            .fields
            .eq(4)
            .val(parseInt(360*(150 - Math.max(0,Math.min(150,(ev.pageY - ev.data.y))))/150, 10))
            .get(0),
            [ev.data.preview]
            );
        return false;
    },
    upHue = function (ev) {
        fillRGBFields(ev.data.cal.data('colorpicker').color, ev.data.cal.get(0));
        fillHexFields(ev.data.cal.data('colorpicker').color, ev.data.cal.get(0));
        $(document).unbind('mouseup', upHue);
        $(document).unbind('mousemove', moveHue);
        return false;
    },
    downSelector = function (ev) {
        var current = {
            cal: $(this).parent(),
            pos: $(this).offset()
        };
        current.preview = current.cal.data('colorpicker').livePreview;
        $(document).bind('mouseup', current, upSelector);
        $(document).bind('mousemove', current, moveSelector);
    },
    moveSelector = function (ev) {
        change.apply(
            ev.data.cal.data('colorpicker')
            .fields
            .eq(6)
            .val(parseInt(100*(150 - Math.max(0,Math.min(150,(ev.pageY - ev.data.pos.top))))/150, 10))
            .end()
            .eq(5)
            .val(parseInt(100*(Math.max(0,Math.min(150,(ev.pageX - ev.data.pos.left))))/150, 10))
            .get(0),
            [ev.data.preview]
            );
        return false;
    },
    upSelector = function (ev) {
        fillRGBFields(ev.data.cal.data('colorpicker').color, ev.data.cal.get(0));
        fillHexFields(ev.data.cal.data('colorpicker').color, ev.data.cal.get(0));
        $(document).unbind('mouseup', upSelector);
        $(document).unbind('mousemove', moveSelector);
        return false;
    },
    enterSubmit = function (ev) {
        $(this).addClass('colorpicker_focus');
    },
    leaveSubmit = function (ev) {
        $(this).removeClass('colorpicker_focus');
    },
    clickSubmit = function (ev) {
        var cal = $(this).parent();
        var col = cal.data('colorpicker').color;
        cal.data('colorpicker').origColor = col;
        setCurrentColor(col, cal.get(0));
        cal.data('colorpicker').onSubmit(col, HSBToHex(col), HSBToRGB(col), cal.data('colorpicker').el);
    },
    show = function (ev) {
        var cal = $('#' + $(this).data('colorpickerId'));
        cal.data('colorpicker').onBeforeShow.apply(this, [cal.get(0)]);
        var pos = $(this).offset();
        var viewPort = getViewport();
        var top = pos.top + this.offsetHeight;
        var left = pos.left;
        if (top + 176 > viewPort.t + viewPort.h) {
            top -= this.offsetHeight + 176;
        }
        if (left + 356 > viewPort.l + viewPort.w) {
            left -= 356;
        }
        cal.css({
            left: left + 'px', 
            top: top + 'px'
        });
        if (cal.data('colorpicker').onShow.apply(this, [cal.get(0)]) != false) {
            cal.show();
        }
        $(document).bind('mousedown', {
            cal: cal
        }, hide);
        return false;
    },
    hide = function (ev) {
        if (!isChildOf(ev.data.cal.get(0), ev.target, ev.data.cal.get(0))) {
            if (ev.data.cal.data('colorpicker').onHide.apply(this, [ev.data.cal.get(0)]) != false) {
                ev.data.cal.hide();
            }
            $(document).unbind('mousedown', hide);
        }
    },
    isChildOf = function(parentEl, el, container) {
        if (parentEl == el) {
            return true;
        }
        if (parentEl.contains) {
            return parentEl.contains(el);
        }
        if ( parentEl.compareDocumentPosition ) {
            return !!(parentEl.compareDocumentPosition(el) & 16);
        }
        var prEl = el.parentNode;
        while(prEl && prEl != container) {
            if (prEl == parentEl)
                return true;
            prEl = prEl.parentNode;
        }
        return false;
    },
    getViewport = function () {
        var m = document.compatMode == 'CSS1Compat';
        return {
            l : window.pageXOffset || (m ? document.documentElement.scrollLeft : document.body.scrollLeft),
            t : window.pageYOffset || (m ? document.documentElement.scrollTop : document.body.scrollTop),
            w : window.innerWidth || (m ? document.documentElement.clientWidth : document.body.clientWidth),
            h : window.innerHeight || (m ? document.documentElement.clientHeight : document.body.clientHeight)
        };
    },
    fixHSB = function (hsb) {
        return {
            h: Math.min(360, Math.max(0, hsb.h)),
            s: Math.min(100, Math.max(0, hsb.s)),
            b: Math.min(100, Math.max(0, hsb.b))
        };
    }, 
    fixRGB = function (rgb) {
        return {
            r: Math.min(255, Math.max(0, rgb.r)),
            g: Math.min(255, Math.max(0, rgb.g)),
            b: Math.min(255, Math.max(0, rgb.b))
        };
    },
    fixHex = function (hex) {
        var len = 6 - hex.length;
        if (len > 0) {
            var o = [];
            for (var i=0; i<len; i++) {
                o.push('0');
            }
            o.push(hex);
            hex = o.join('');
        }
        return hex;
    }, 
    HexToRGB = function (hex) {
        var hex = parseInt(((hex.indexOf('#') > -1) ? hex.substring(1) : hex), 16);
        return {
            r: hex >> 16, 
            g: (hex & 0x00FF00) >> 8, 
            b: (hex & 0x0000FF)
        };
    },
    HexToHSB = function (hex) {
        return RGBToHSB(HexToRGB(hex));
    },
    RGBToHSB = function (rgb) {
        var hsb = {
            h: 0,
            s: 0,
            b: 0
        };
        var min = Math.min(rgb.r, rgb.g, rgb.b);
        var max = Math.max(rgb.r, rgb.g, rgb.b);
        var delta = max - min;
        hsb.b = max;
        if (max != 0) {
					
        }
        hsb.s = max != 0 ? 255 * delta / max : 0;
        if (hsb.s != 0) {
            if (rgb.r == max) {
                hsb.h = (rgb.g - rgb.b) / delta;
            } else if (rgb.g == max) {
                hsb.h = 2 + (rgb.b - rgb.r) / delta;
            } else {
                hsb.h = 4 + (rgb.r - rgb.g) / delta;
            }
        } else {
            hsb.h = -1;
        }
        hsb.h *= 60;
        if (hsb.h < 0) {
            hsb.h += 360;
        }
        hsb.s *= 100/255;
        hsb.b *= 100/255;
        return hsb;
    },
    HSBToRGB = function (hsb) {
        var rgb = {};
        var h = Math.round(hsb.h);
        var s = Math.round(hsb.s*255/100);
        var v = Math.round(hsb.b*255/100);
        if(s == 0) {
            rgb.r = rgb.g = rgb.b = v;
        } else {
            var t1 = v;
            var t2 = (255-s)*v/255;
            var t3 = (t1-t2)*(h%60)/60;
            if(h==360) h = 0;
            if(h<60) {
                rgb.r=t1;
                rgb.b=t2;
                rgb.g=t2+t3
            }
            else if(h<120) {
                rgb.g=t1;
                rgb.b=t2;
                rgb.r=t1-t3
            }
            else if(h<180) {
                rgb.g=t1;
                rgb.r=t2;
                rgb.b=t2+t3
            }
            else if(h<240) {
                rgb.b=t1;
                rgb.r=t2;
                rgb.g=t1-t3
            }
            else if(h<300) {
                rgb.b=t1;
                rgb.g=t2;
                rgb.r=t2+t3
            }
            else if(h<360) {
                rgb.r=t1;
                rgb.g=t2;
                rgb.b=t1-t3
            }
            else {
                rgb.r=0;
                rgb.g=0;
                rgb.b=0
            }
        }
        return {
            r:Math.round(rgb.r), 
            g:Math.round(rgb.g), 
            b:Math.round(rgb.b)
        };
    },
    RGBToHex = function (rgb) {
        var hex = [
        rgb.r.toString(16),
        rgb.g.toString(16),
        rgb.b.toString(16)
        ];
        $.each(hex, function (nr, val) {
            if (val.length == 1) {
                hex[nr] = '0' + val;
            }
        });
        return hex.join('');
    },
    HSBToHex = function (hsb) {
        return RGBToHex(HSBToRGB(hsb));
    },
    restoreOriginal = function () {
        var cal = $(this).parent();
        var col = cal.data('colorpicker').origColor;
        cal.data('colorpicker').color = col;
        fillRGBFields(col, cal.get(0));
        fillHexFields(col, cal.get(0));
        fillHSBFields(col, cal.get(0));
        setSelector(col, cal.get(0));
        setHue(col, cal.get(0));
        setNewColor(col, cal.get(0));
    };
    return {
        init: function (opt) {
            opt = $.extend({}, defaults, opt||{});
            if (typeof opt.color == 'string') {
                opt.color = HexToHSB(opt.color);
            } else if (opt.color.r != undefined && opt.color.g != undefined && opt.color.b != undefined) {
                opt.color = RGBToHSB(opt.color);
            } else if (opt.color.h != undefined && opt.color.s != undefined && opt.color.b != undefined) {
                opt.color = fixHSB(opt.color);
            } else {
                return this;
            }
            return this.each(function () {
                if (!$(this).data('colorpickerId')) {
                    var options = $.extend({}, opt);
                    options.origColor = opt.color;
                    var id = 'collorpicker_' + parseInt(Math.random() * 1000);
                    $(this).data('colorpickerId', id);
                    var cal = $(tpl).attr('id', id);
                    if (options.flat) {
                        cal.appendTo(this).show();
                    } else {
                        cal.appendTo(document.body);
                    }
                    options.fields = cal
                    .find('input')
                    .bind('keyup', keyDown)
                    .bind('change', change)
                    .bind('blur', blur)
                    .bind('focus', focus);
                    cal
                    .find('span').bind('mousedown', downIncrement).end()
                    .find('>div.colorpicker_current_color').bind('click', restoreOriginal);
                    options.selector = cal.find('div.colorpicker_color').bind('mousedown', downSelector);
                    options.selectorIndic = options.selector.find('div div');
                    options.el = this;
                    options.hue = cal.find('div.colorpicker_hue div');
                    cal.find('div.colorpicker_hue').bind('mousedown', downHue);
                    options.newColor = cal.find('div.colorpicker_new_color');
                    options.currentColor = cal.find('div.colorpicker_current_color');
                    cal.data('colorpicker', options);
                    cal.find('div.colorpicker_submit')
                    .bind('mouseenter', enterSubmit)
                    .bind('mouseleave', leaveSubmit)
                    .bind('click', clickSubmit);
                    fillRGBFields(options.color, cal.get(0));
                    fillHSBFields(options.color, cal.get(0));
                    fillHexFields(options.color, cal.get(0));
                    setHue(options.color, cal.get(0));
                    setSelector(options.color, cal.get(0));
                    setCurrentColor(options.color, cal.get(0));
                    setNewColor(options.color, cal.get(0));
                    if (options.flat) {
                        cal.css({
                            position: 'relative',
                            display: 'block'
                        });
                    } else {
                        $(this).bind(options.eventName, show);
                    }
                }
            });
        },
        showPicker: function() {
            return this.each( function () {
                if ($(this).data('colorpickerId')) {
                    show.apply(this);
                }
            });
        },
        hidePicker: function() {
            return this.each( function () {
                if ($(this).data('colorpickerId')) {
                    $('#' + $(this).data('colorpickerId')).hide();
                }
            });
        },
        setColor: function(col) {
            if (typeof col == 'string') {
                col = HexToHSB(col);
            } else if (col.r != undefined && col.g != undefined && col.b != undefined) {
                col = RGBToHSB(col);
            } else if (col.h != undefined && col.s != undefined && col.b != undefined) {
                col = fixHSB(col);
            } else {
                return this;
            }
            return this.each(function(){
                if ($(this).data('colorpickerId')) {
                    var cal = $('#' + $(this).data('colorpickerId'));
                    cal.data('colorpicker').color = col;
                    cal.data('colorpicker').origColor = col;
                    fillRGBFields(col, cal.get(0));
                    fillHSBFields(col, cal.get(0));
                    fillHexFields(col, cal.get(0));
                    setHue(col, cal.get(0));
                    setSelector(col, cal.get(0));
                    setCurrentColor(col, cal.get(0));
                    setNewColor(col, cal.get(0));
                }
            });
        }
    };
}();
$.fn.extend({
    ColorPicker: ColorPicker.init,
    ColorPickerHide: ColorPicker.hidePicker,
    ColorPickerShow: ColorPicker.showPicker,
    ColorPickerSetColor: ColorPicker.setColor
});
//})(jQuery)

/**
 * jQuery.bottom
 * Dual licensed under MIT and GPL.
 * Date: 2010-04-25
 *
 * @description Trigger the bottom event when the user has scrolled to the bottom of an element
 * @author Jim Yi
 * @version 1.0
 *
 * @id jQuery.fn.bottom
 * @param {Object} settings Hash of settings.
 * @return {jQuery} Returns the same jQuery object for chaining.
 *
 */
(function($){
    $.fn.bottom = function(options) {

        var defaults = {
            // how close to the scrollbar is to the bottom before triggering the event
            proximity: 0
        };

        var options = $.extend(defaults, options);

        return this.each(function() {
            var obj = this;
            $(obj).bind("scroll", function() {
                if (obj == window) {
                    scrollHeight = $(document).height();
                }
                else {
                    scrollHeight = $(obj)[0].scrollHeight;
                }
                scrollPosition = $(obj).height() + $(obj).scrollTop();
                if ( (scrollHeight - scrollPosition) / scrollHeight <= options.proximity) {
                    $(obj).trigger("bottom");
                }
            });

            return false;
        });
    };
})(jQuery);
    
/* Swag (Give your handlebars.js templates some swag son!)
  
  Copyright (c) 2012 Elving Rodríguez

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.*/

(function(){
    var e,t,n,r,i=[].indexOf||function(e){
        for(var t=0,n=this.length;t<n;t++)if(t in this&&this[t]===e)return t;return-1
    };
        
    n=typeof window!="undefined"&&window!==null?window.Swag={}:void 0,typeof module!="undefined"&&module!==null&&(module.exports=n={}),n.Config={
        partialsPath:""
    },r={},r.toString=Object.prototype.toString,r.isUndefined=function(e){
        return e==="undefined"||r.toString.call(e)==="[object Function]"||e.hash!=null
    },r.safeString=function(e){
        return new Handlebars.SafeString(e)
    },r.trim=function(e){
        var t;
        return t=/\S/.test(" ")?/^[\s\xA0]+|[\s\xA0]+$/g:/^\s+|\s+$/g,e.toString().replace(t,"")
    },Handlebars.registerHelper("lowercase",function(e){
        return e.toLowerCase()
    }),Handlebars.registerHelper("uppercase",function(e){
        return e.toUpperCase()
    }),Handlebars.registerHelper("capitalizeFirst",function(e){
        return e.charAt(0).toUpperCase()+e.slice(1)
    }),Handlebars.registerHelper("capitalizeEach",function(e){
        return e.replace(/\w\S*/g,function(e){
            return e.charAt(0).toUpperCase()+e.substr(1)
        })
    }),Handlebars.registerHelper("titleize",function(e){
        var t,n,i,s;
        return n=e.replace(/[ \-_]+/g," "),s=r.trim(n.replace(/([A-Z])/g," $&")).split(" "),t=function(e){
            return e.charAt(0).toUpperCase()+e.slice(1)
        },function(){
            var e,n,r;
            r=[];
            for(e=0,n=s.length;e<n;e++)i=s[e],r.push(t(i));
            return r
        }().join(" ")
    }),Handlebars.registerHelper("sentence",function(e){
        return e.replace(/((?:\S[^\.\?\!]*)[\.\?\!]*)/g,function(e){
            return e.charAt(0).toUpperCase()+e.substr(1).toLowerCase()
        })
    }),Handlebars.registerHelper("reverse",function(e){
        return e.split("").reverse().join("")
    }),Handlebars.registerHelper("truncate",function(e,t,n){
        return r.isUndefined(n)&&(n=""),e.length>t?e.substring(0,t-n.length)+n:e
    }),Handlebars.registerHelper("center",function(e,t){
        var n,r;
        r="",n=0;
        while(n<t)r+="&nbsp;",n++;
        return""+r+e+r
    }),Handlebars.registerHelper("first",function(e,t){
        return r.isUndefined(t)?e[0]:e.slice(0,t)
    }),Handlebars.registerHelper("withFirst",function(e,t,n){
        var i,s;
        if(r.isUndefined(t))return n=t,n.fn(e[0]);
        e=e.slice(0,t),s="";
        for(i in e)s+=n.fn(e[i]);return s
    }),Handlebars.registerHelper("last",function(e,t){
        return r.isUndefined(t)?e[e.length-1]:e.slice(-t)
    }),Handlebars.registerHelper("withLast",function(e,t,n){
        var i,s;
        if(r.isUndefined(t))return n=t,n.fn(e[e.length-1]);
        e=e.slice(-t),s="";
        for(i in e)s+=n.fn(e[i]);return s
    }),Handlebars.registerHelper("after",function(e,t){
        return e.slice(t)
    }),Handlebars.registerHelper("withAfter",function(e,t,n){
        var r,i;
        e=e.slice(t),i="";
        for(r in e)i+=n.fn(e[r]);return i
    }),Handlebars.registerHelper("before",function(e,t){
        return e.slice(0,-t)
    }),Handlebars.registerHelper("withBefore",function(e,t,n){
        var r,i;
        e=e.slice(0,-t),i="";
        for(r in e)i+=n.fn(e[r]);return i
    }),Handlebars.registerHelper("join",function(e,t){
        return e.join(r.isUndefined(t)?" ":t)
    }),Handlebars.registerHelper("sort",function(e,t){
        return r.isUndefined(t)?e.sort():e.sort(function(e,n){
            return e[t]>n[t]
        })
    }),Handlebars.registerHelper("withSort",function(e,t,n){
        var i,s;
        if(r.isUndefined(t))return n=t,n.fn(e.sort());
        e=e.sort(function(e,n){
            return e[t]>n[t]
        }),s="";
        for(i in e)s+=n.fn(e[i]);return s
    }),Handlebars.registerHelper("length",function(e){
        return e.length
    }),Handlebars.registerHelper("lengthEqual",function(e,t,n){
        return e.length===t?n.fn(this):n.inverse(this)
    }),Handlebars.registerHelper("empty",function(e,t){
        return e.length<=0?t.fn(this):t.inverse(this)
    }),Handlebars.registerHelper("any",function(e,t){
        return e.length>0?t.fn(this):t.inverse(this)
    }),Handlebars.registerHelper("inArray",function(e,t,n){
        return e.indexOf(t)!==-1?n.fn(this):n.inverse(this)
    }),Handlebars.registerHelper("eachIndex",function(e,t){
        var n,r,i,s;
        s="",t.data!=null&&(n=Handlebars.createFrame(t.data));
        if(e&&e.length>0){
            r=0,i=e.length;
            while(r<i)n&&(n.index=r),e[r].index=r,s+=t.fn(e[r]),r++
        }else s=t.inverse(this);
        return s
    }),Handlebars.registerHelper("add",function(e,t){
        return e+t
    }),Handlebars.registerHelper("subtract",function(e,t){
        return e-t
    }),Handlebars.registerHelper("divide",function(e,t){
        return e/t
    }),Handlebars.registerHelper("multiply",function(e,t){
        return e*t
    }),Handlebars.registerHelper("floor",function(e){
        return Math.floor(e)
    }),Handlebars.registerHelper("ceil",function(e){
        return Math.ceil(e)
    }),Handlebars.registerHelper("round",function(e){
        return Math.round(e)
    }),Handlebars.registerHelper("toFixed",function(e,t){
        return e.toFixed(r.isUndefined(t)?t:void 0)
    }),Handlebars.registerHelper("toPrecision",function(e,t){
        return e.toPrecision(r.isUndefined(t)?t:void 0)
    }),Handlebars.registerHelper("toExponential",function(e,t){
        return e.toExponential(r.isUndefined(t)?t:void 0)
    }),Handlebars.registerHelper("toInt",function(e){
        return parseInt(e,10)
    }),Handlebars.registerHelper("toFloat",function(e){
        return parseFloat(e)
    }),Handlebars.registerHelper("addCommas",function(e){
        return e.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g,"$1,")
    }),Handlebars.registerHelper("equal",function(e,t,n){
        return e===t?n.fn(this):n.inverse(this)
    }),Handlebars.registerHelper("notEqual",function(e,t,n){
        return e!==t?n.fn(this):n.inverse(this)
    }),Handlebars.registerHelper("gt",function(e,t,n){
        return e>t?n.fn(this):n.inverse(this)
    }),Handlebars.registerHelper("gte",function(e,t,n){
        return e>=t?n.fn(this):n.inverse(this)
    }),Handlebars.registerHelper("lt",function(e,t,n){
        return e<t?n.fn(this):n.inverse(this)
    }),Handlebars.registerHelper("lte",function(e,t,n){
        return e<=t?n.fn(this):n.inverse(this)
    }),e={},e.padNumber=function(e,t,n){
        var r,i;
        typeof n=="undefined"&&(n="0"),r=t-String(e).length,i="";
        if(r>0)while(r--)i+=n;
        return i+e
    },e.dayOfYear=function(e){
        var t;
        return t=new Date(e.getFullYear(),0,1),Math.ceil((e-t)/864e5)
    },e.weekOfYear=function(e){
        var t;
        return t=new Date(e.getFullYear(),0,1),Math.ceil(((e-t)/864e5+t.getDay()+1)/7)
    },e.isoWeekOfYear=function(e){
        var t,n,r,i;
        return i=new Date(e.valueOf()),n=(e.getDay()+6)%7,i.setDate(i.getDate()-n+3),r=new Date(i.getFullYear(),0,4),t=(i-r)/864e5,1+Math.ceil(t/7)
    },e.tweleveHour=function(e){
        return e.getHours()>12?e.getHours()-12:e.getHours()
    },e.timeZoneOffset=function(t){
        var n,r;
        return n=-t.getTimezoneOffset()/60,r=e.padNumber(Math.abs(n),4),(n>0?"+":"-")+r
    },e.format=function(t,n){
        return n.replace(e.formats,function(n,r){
            switch(r){
                case"a":
                    return e.abbreviatedWeekdays[t.getDay()];
                case"A":
                    return e.fullWeekdays[t.getDay()];
                case"b":
                    return e.abbreviatedMonths[t.getMonth()];
                case"B":
                    return e.fullMonths[t.getMonth()];
                case"c":
                    return t.toLocaleString();
                case"C":
                    return Math.round(t.getFullYear()/100);
                case"d":
                    return e.padNumber(t.getDate(),2);
                case"D":
                    return e.format(t,"%m/%d/%y");
                case"e":
                    return e.padNumber(t.getDate(),2," ");
                case"F":
                    return e.format(t,"%Y-%m-%d");
                case"h":
                    return e.format(t,"%b");
                case"H":
                    return e.padNumber(t.getHours(),2);
                case"I":
                    return e.padNumber(e.tweleveHour(t),2);
                case"j":
                    return e.padNumber(e.dayOfYear(t),3);
                case"k":
                    return e.padNumber(t.getHours(),2," ");
                case"l":
                    return e.padNumber(e.tweleveHour(t),2," ");
                case"L":
                    return e.padNumber(t.getMilliseconds(),3);
                case"m":
                    return e.padNumber(t.getMonth()+1,2);
                case"M":
                    return e.padNumber(t.getMinutes(),2);
                case"n":
                    return"\n";
                case"p":
                    return t.getHours()>11?"PM":"AM";
                case"P":
                    return e.format(t,"%p").toLowerCase();
                case"r":
                    return e.format(t,"%I:%M:%S %p");
                case"R":
                    return e.format(t,"%H:%M");
                case"s":
                    return t.getTime()/1e3;
                case"S":
                    return e.padNumber(t.getSeconds(),2);
                case"t":
                    return" ";
                case"T":
                    return e.format(t,"%H:%M:%S");
                case"u":
                    return t.getDay()===0?7:t.getDay();
                case"U":
                    return e.padNumber(e.weekOfYear(t),2);
                case"v":
                    return e.format(t,"%e-%b-%Y");
                case"V":
                    return e.padNumber(e.isoWeekOfYear(t),2);
                case"W":
                    return e.padNumber(e.weekOfYear(t),2);
                case"w":
                    return e.padNumber(t.getDay(),2);
                case"x":
                    return t.toLocaleDateString();
                case"X":
                    return t.toLocaleTimeString();
                case"y":
                    return String(t.getFullYear()).substring(2);
                case"Y":
                    return t.getFullYear();
                case"z":
                    return e.timeZoneOffset(t);
                default:
                    return match
            }
        })
    },e.formats=/%(a|A|b|B|c|C|d|D|e|F|h|H|I|j|k|l|L|m|M|n|p|P|r|R|s|S|t|T|u|U|v|V|W|w|x|X|y|Y|z)/g,e.abbreviatedWeekdays=["Sun","Mon","Tue","Wed","Thur","Fri","Sat"],e.fullWeekdays=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],e.abbreviatedMonths=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],e.fullMonths=["January","February","March","April","May","June","July","August","September","October","November","December"],Handlebars.registerHelper("formatDate",function(t,n){
        return t=new Date(t),e.format(t,n)
    }),Handlebars.registerHelper("now",function(t){
        var n;
        return n=new Date,r.isUndefined(t)?n:e.format(n,t)
    }),Handlebars.registerHelper("timeago",function(e){
        var t,n;
        return e=new Date(e),n=Math.floor((new Date-e)/1e3),t=Math.floor(n/31536e3),t>1?""+t+" years ago":(t=Math.floor(n/2592e3),t>1?""+t+" months ago":(t=Math.floor(n/86400),t>1?""+t+" days ago":(t=Math.floor(n/3600),t>1?""+t+" hours ago":(t=Math.floor(n/60),t>1?""+t+" minutes ago":Math.floor(n)===0?"Just now":Math.floor(n)+" seconds ago"))))
    }),Handlebars.registerHelper("inflect",function(e,t,n,i){
        var s;
        return s=e>1||e===0?n:t,r.isUndefined(i)||i===!1?s:""+e+" "+s
    }),Handlebars.registerHelper("ordinalize",function(e){
        var t,n;
        t=Math.abs(Math.round(e));
        if(n=t%100,i.call([11,12,13],n)>=0)return""+e+"th";
        switch(t%10){
            case 1:
                return""+e+"st";
            case 2:
                return""+e+"nd";
            case 3:
                return""+e+"rd";
            default:
                return""+e+"th"
        }
    }),t={},t.parseAttributes=function(e){
        return Object.keys(e).map(function(t){
            return""+t+'="'+e[t]+'"'
        }).join(" ")
    },Handlebars.registerHelper("ul",function(e,n){
        return"<ul "+t.parseAttributes(n.hash)+">"+e.map(function(e){
            return"<li>"+n.fn(e)+"</li>"
        }).join("\n")+"</ul>"
    }),Handlebars.registerHelper("ol",function(e,n){
        return"<ol "+t.parseAttributes(n.hash)+">"+e.map(function(e){
            return"<li>"+n.fn(e)+"</li>"
        }).join("\n")+"</ol>"
    }),Handlebars.registerHelper("br",function(e,t){
        var n,i;
        n="<br>";
        if(!r.isUndefined(e)){
            i=0;
            while(i<e-1)n+="<br>",i++
        }
        return r.safeString(n)
    }),Handlebars.registerHelper("log",function(e){
        return console.log(e)
    }),Handlebars.registerHelper("debug",function(e){
        return console.debug("Context: ",this),r.isUndefined(e)||console.debug("Value: ",e),console.log("-----------------------------------------------")
    }),Handlebars.registerHelper("default",function(e,t){
        var n;
        return n=e!=null?e:t,n?n:t
    }),Handlebars.registerHelper("partial",function(e,t){
        var i;
        return i=n.Config.partialsPath+e,t=r.isUndefined(t)?{}:t,Handlebars.partials[e]==null&&Handlebars.registerPartial(e,require(i)),r.safeString(Handlebars.partials[e](t))
    })
}).call(this)