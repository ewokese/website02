"use strict";


//////////////////////////////////////////////////////////////////////////////
//
//	Common helper functions and constants.
//    Please minimize dependencies in this file.
// 
//////////////////////////////////////////////////////////////////////////////


define(['config'],function(config) {

function tool_isTool()
{
    return typeof app === "undefined" || app.type === "tool";
}

var fontUnit = "px";

function DoTween( duration, initialValue, targetValue, ease, updateFunc, delay )
{
    var obj = { val : initialValue || 0 };

    return TweenMax.to(obj, duration, {delay:delay === undefined ? 1 : delay, val:targetValue, ease:ease, onUpdate: function(){ updateFunc( obj.val ); } }); 
}

function BackEaseOut(p)
{
    var p1 = 1.70158;
    return ((p = p - 1) * p * ((p1 + 1) * p + p1) + 1);
}


function BounceEaseOut(p) {
    if (p < 1 / 2.75) {
        return 7.5625 * p * p;
    } else if (p < 2 / 2.75) {
        return 7.5625 * (p -= 1.5 / 2.75) * p + 0.75;
    } else if (p < 2.5 / 2.75) {
        return 7.5625 * (p -= 2.25 / 2.75) * p + 0.9375;
    }
    return 7.5625 * (p -= 2.625 / 2.75) * p + 0.984375;
}

function CircEaseOut(p) {
				return Math.sqrt(1 - (p = p - 1) * p);
			}

function ExpoEaseOut(p) {
				return 1 - Math.pow(2, -10 * p);
			}

function SineEaseOut(p) {
				return Math.sin(p * Math.PI/2);
			}


function getColors( tileData, instanceData, defaultColors )
{
    var colors = {};

    var instanceColors = instanceData.colors || {};
    var tileColors = tileData.colors || {};

    // defaultValue should always specify all of the possible things necessary.
    for( var c in defaultColors )
    {
        colors[c] = [instanceColors[c], tileColors[c], defaultColors[c]].filter(function(a) { return a !== undefined && typeof a == 'string'; })[0];
    }    

    // console.log( instanceColors, tileColors, defaultColors, colors );

    return colors;
}

function getValue( property, tileData, instanceData, defaultValue )
{
    if( property in instanceData ) return instanceData[property];
    if( property in tileData ) return tileData[property];
    return defaultValue;
}


function getValues( tileData, instanceData, defaultValues, ignoreProperties )
{
	var values = {};
	ignoreProperties = ignoreProperties || [];

	for( var p in tileData )
	{
		if( ignoreProperties.indexOf(p) == -1 )
		{
			values[p] = getValue(p, tileData, instanceData, defaultValues[p] );
		}
	}

	for( var p in instanceData )
	{
		if( ignoreProperties.indexOf(p) == -1 && !( p in values ))
		{
			values[p] = getValue(p, tileData, instanceData, defaultValues[p] );
		}
	}

	for( var p in defaultValues )
	{
		if( ignoreProperties.indexOf(p) == -1 && !( p in values ))
		{
			values[p] = getValue(p, tileData, instanceData, defaultValues[p] );
		}
	}

	for( var p in values )
	{
		if( values[p] === undefined )
		{
			delete values[p];
		}
	}

	return values;
}




function calcRect( tileSize, rect, func )
{
    func = func || function(a){return a;}

    return {
        x : func( tileSize.width * ( rect.x + rect.width > 1 ? 1 - rect.width : rect.x ) ),
        y : func(tileSize.height * ( rect.y + rect.height > 1 ? 1 - rect.height : rect.y ) ),
        width : func(tileSize.width * rect.width ),
        height : func(tileSize.height * rect.height ),
    }
}




function mergeObjects(a,b, blendObjects)
{
    var c = {};
    for( var p in a )   {   c[p] = a[p]  }

    if( blendObjects )
    {
        for( var p in b )   
        {
            var t = typeof c[p];
            if( t === "object" && t === typeof b[p] )
            {
                c[p] = mergeObjects(c[p], b[p]);    // save to use c[p] here because mergeObjects creates a new object.
            }
            else
            {
                c[p] = b[p];
            }
        }
    }
    else
    {
        for( var p in b )   {   c[p] = b[p]  }
    }

    return c;
}

function copyObject(src, changes)
{
	if( !src )	return null;

    var cp = JSON.parse(JSON.stringify(src));
    for( var p in src )
    {
    	// copy non JSON objects.
    	if( !(p in cp ) )
    	{
    		cp[p] = src[p];
    	}
    }

    for(var p in (changes||{}))
    {
        cp[p] = changes[p];
    }
    return cp;
}

function clearObject(obj, except)
{
    var props = [];
    for( var p in obj )
    {
        if( !except || except.indexOf(p) == -1 )
        {
            props.push(p);
        }
    }

    props.forEach(function(p){ delete obj[p] ;});
}

function areAllFieldsBlank(obj)
{
	for( var p in obj )
	{
		if( obj[p])
			return false;
	}

	return true;
}

function isObjectEmpty(obj)
{
	for( var p in obj )
	{
		return false;
	}
	return true;
}


function mapFields( obj, mapping, copyUnmodified )
{
    var out = copyUnmodified ? copyObject(obj) : {};

    for( var p in mapping )
    {
        setObjectValue(out, p, getObjectValue(obj, mapping[p] ));
    }

    return out;
}


function getObjectValue( object, key )
{
	if( !object || !key ) return;

	var path = key.split(".");
	var obj = object;

	for( var i = 0; i < path.length; ++i )	
	{
		var p = path[i];

		if( !( p in obj ))
		{
			obj = undefined;
			break;
		}
		else
		{
			obj = obj[p];
		}
		if (obj == null || obj == undefined) {
		    break;
		}
	}

	return obj;
}

function setObjectValue( object, key, value )
{
	if( !object || !key ) return;

	var path = key.split(".");
	var obj = object;

	for( var i = 0; i < path.length; ++i )
	{
		var p = path[i];
		if( i == path.length - 1 )
		{
			obj[p] = value;
		}
		else if( typeof obj[p] == 'undefined' || obj[p] == null )
		{
			obj = obj[p] = {};
		}
		else if( typeof obj[p] == 'object' )
		{
			obj = obj[p];
		}
	}
}


function stopEvent(evt)
{
	evt && evt.preventDefault();
	evt && evt.stopPropagation();
}



/*
	Criteria in order of relevance

    var sortCriteria = ["nation", "level", "type",  "name"];

    or

    var sortCriteria = [{field:"nation", order:-1}, "level", {field:"type"},  "name"];

	// special case. force to one end with this value.
	{ value:0, field:tank_id, order:1 }	// to the back. -1 to the front.
*/

function compare(a,b, aorder )
{
    return a == b ? 0 : ( a > b ? 1*aorder : -1*aorder );
}

function objectSort(list, sortCriteria)
{
	if( !list ) return;

	if( typeof sortCriteria == "string")
	{
		sortCriteria = [{ field: sortCriteria, order:1}];
	}
	else if( !(sortCriteria instanceof Array ) )
	{
		sortCriteria = [sortCriteria];
	}

	var sortOptions = sortCriteria.map(function(v) {
		if( typeof v == "string" )
		{
			return { field : v, order : 1};
		}
		else
		{
			if( !('order' in v ) )
			{
				return copyObject( v, { order : 1 });
			}
			else
			{
				return copyObject(v);
			}
		}
	});

	list.sort(function(a,b)
    {
    	var result;
        sortOptions.some(function(v)
        {
            var av = (getObjectValue(a, v.field) || "");
            var bv = (getObjectValue(b, v.field) || "");

        	if( 'value' in v )
        	{
        		if( av === v.value )
        		{
        			result = v.order;
        			return true;
        		}
        		if( bv === v.value )
        		{
        			result = -v.order;
        			return true;
        		}

        		return false;
        	}
        	else if ('caseinsensitive' in v && v['caseinsensitive'] == true) {
        	    result = compare(av.toLowerCase(), bv.toLowerCase(), v.order);
        	    return result != 0;
        	}
        	else {
        	    result = compare(av, bv, v.order);
        	    return result != 0;
        	}
        });

        return result;
    });
}


function filterObject(list,obj)
{
    var outObj = {};
    list.forEach(function(v) {
        outObj[v] = obj[v];
    });
    return outObj;
}

function objectKeysToArray(obj)
{
    if( !obj ) return [];

    var keys = [];
    for( var p in obj )
    {
        keys.push(p);
    }
    return keys;
}

function objectToArray(iter)
{
    if( !iter ) return [];

    if( iter instanceof Array )
    {
        return iter.slice();
    }

    if( typeof iter !== "object" )
    {
        return [];
    }

    var result = [];
    for( var p in iter )
    {
        result.push(iter[p]);
    }

    return result;
}

function arrayToObject( array, keyProperty, valueProperty )
{
    var result = {};
    if( !array ) return result;

    array.forEach(function(e)
    {
        result[e[keyProperty]] = valueProperty ? e[valueProperty] : e;
    });

    return result;
}



function getMessageAndStack(err)
{
    if( err )
    {
        var errorMessage = err.stack || "";

        if( errorMessage.indexOf( err.message ) === -1 )
        {
            // occasional inconsistency as to what is provided in the callstack. Some implementations include the message, some don't. We want both always.
            errorMessage = err.message + " \n" + errorMessage;
        }

        return errorMessage;
    }
    else
    {
        return "";
    }
}

function getCallstack()
{
	var e = new Error();
	return e.stack;
}


function createId()
{
	// relative short strings, reasonably large number space, collisions unlikely.
    return Math.round(0xfffffffffffff * Math.random()).toString(36)
}


function createProxyProperty( obj, prop, onSet, onGet )
{
	var internalName = "__" + propName + "__";
	var def = { 
		enumerable:true, 
		configurable:true, 
		set : function(v) { onSet && onSet( propName, v ); this[internalName] = v; }, 
		get : function() { onGet && onGet(propName, v); return this[internalName]; } 
	};

	var internalDef = {
		enumerable :false,
		configurable:false,
		writable:true,
	}

	Object.defineProperty(obj, propName, def );
	Object.defineProperty(obj, internalName, internalDef );
}

function createProxy( props, onSet, onGet )
{
	var obj = {};
	for( var p in props )
	{
		var propName = props instanceof Array ? props[p] : p;
		createProxyProperty( obj, propName, onSet, onGet );
	}

	if( !(props instanceof Array ))
	{
		for( var p in props )
		{
			obj[p] = props[p];
		}
	}


	return obj;
}



function PageTransitionData(targetContainer, startTimeViewFromLayout) {

    this.fromLayout = "";

    if (targetContainer.container.layoutName) {
        this.fromLayout = targetContainer.container.layoutName;
        if (targetContainer.container.layoutName == "serviceRecordScreen") {
            // so that we can report individual service record screen sub-layouts to analytics, 
            // we convert serviceRecordScreen to playerStatsContainer, ratingsContainer, or awardSelector.
            // since this is the from layout, we look at the existing layout to see what is in the details subcontainer
            var serviceRecordScreenDetails = app.controller.elementMap["serviceRecordScreenDetails"];
            if (serviceRecordScreenDetails) {
                this.fromLayout = serviceRecordScreenDetails.container.layoutName;
            }
        }
    }
    this.startTimeViewFromLayout = startTimeViewFromLayout;
    this.startTimeTransition = new Date().getTime();

}


PageTransitionData.prototype.SendPageTransitionAnalytics = function (toLayout) {

    var userId = "";
    if (app.controller.account_id) {
        userId = app.controller.account_id;
    }

	if (config.AppConfig.useRemoteLogging ) 
	{
	    if (this.startTimeViewFromLayout > 0) {
	        var totalPageTime = new Date().getTime() - this.startTimeViewFromLayout;
	        ga('send', 'timing', 'view', this.fromLayout, totalPageTime);
	    }
	}

    if (toLayout == "_tempBackLayout") {
        // look up the real name
        var tempLayout = app.controller.getSelectedLayout(payload);
        if (tempLayout) {
            toLayout = tempLayout.layoutName;
        }
    }


    if (toLayout == "serviceRecordScreen") {
        // so that we can report individual service record screen sub-layouts to analytics, 
        // we convert serviceRecordScreen to playerStatsContainer, ratingsContainer, or awardSelector.
        // Since this is the To layout, we look at what is in the ServiceRecord_tab context so we know what we will be navigating too
        switch (app.controller.context.ServiceRecord_tab) {
            case "two":
                toLayout = "ratingsContainer";
                break;

            case "four":
                toLayout = "awardSelector";
                break;

            case "one":
            default:
                toLayout = "playerStatsContainer";
                break;

        }

    }


    if (config.AppConfig.useRemoteLogging ) 
    {
	    //Analytics
	    if (this.fromLayout != toLayout) {
	        ga('send', {
	            'hitType': 'event',          // Required.
	            'eventCategory': 'transition',   // Required.
	            'eventAction': this.fromLayout,    // Required.
	            'eventLabel': toLayout,
	        } );
	        //console.log("GA sent " + this.fromLayout + " -> " + toLayout);
	    }

	    var timeSpent = new Date().getTime() - this.startTimeTransition;

	    ga('send', 'timing', 'transition', toLayout, timeSpent);
	}
}


function TimingData(groupId, eventId) {

    this.groupId = groupId;
    this.eventId = eventId;
    this.startTime = new Date().getTime();
    this.endTime = null;
}

TimingData.prototype.EndEvent = function (bSend) {
    this.endTime = new Date().getTime();

    if (bSend) {
        this.Send();
    }
}

TimingData.prototype.Send = function () {
    if (config.AppConfig.useRemoteLogging ) 
	{
	    if (this.endTime) {
	        ga("send", "timing", this.groupId, this.eventId, (this.endTime - this.startTime));
	    }
	}
}



// compares two versions (of the 1.2.3.4.5 format). Returns 1 if a > b, -1 if b > a, and 0 if a = b
// if bExact is true, the versions will be compared across all components of each version number.
// if bExact is false, the versions will only be compared based on componets common to both version
// Example:  if a = 0.8 and b = 0.8.1, setting bExact will return -1 ( b > a), while setting bExact = false will return 0 (a = b)
function CompareVersions(a, b, bExact) {


    try {
        var aSplit = a.split(".");
        var bSplit = b.split(".");

        var numparts = Math.min(aSplit.length, bSplit.length);

        for (var i = 0; i < numparts; i++) {

            if (parseInt(aSplit[i]) > parseInt(bSplit[i])) {
                return 1;
            }
            else if (parseInt(bSplit[i]) > parseInt(aSplit[i])) {
                return -1;
            }

        }

        // if we got here, they're equal so far
        if (bExact) {
            if (aSplit.length > bSplit.length) {
                return 1;
            }
            else if (bSplit.length > aSplit.length) {
                return -1;
            }
        }
    }
    catch (e ) {
        // some joker put a non-numeric version component in a version 
        console.log("non-numeric version component detected, either " + a + " or " + b);
    }

    return 0;   // they're equal

}


function getFunctionSignature(f)
{
    var reg = /^function (\w+)\(([\s,\w]+)*\)(.*)/;
    var result = reg.exec(f.toString());
    var name = result[1];
    var parameterlist = result[2];

    return {
        name : name,
        parameters : parameterlist ? parameterlist.split(',').map(function(p) { return p.trim(); }) : []
    };
}

function getClassName(obj)
{
    var func;
    if( typeof obj == 'function')
    {
        func = obj;
    }
    else if( obj )
    {
        func = obj.constructor;
    }

    if( !func ) return undefined;

    return getFunctionSignature(func).name;
}


function collateModules( moduleList, args, extrasCallback )
{
	// ensure this is a real array.
	var argsArray = Array.prototype.slice.call(args);

    var modules = Array.prototype.splice.call( argsArray, argsArray.length - moduleList.length );

    var moduleExports = {};

    modules.forEach(function( module, idx, arr )
    {
        var className = getClassName( module );
       moduleExports[className] = module;
    });

    if( extrasCallback )
    {
    	extrasCallback( moduleExports );
    }

    return moduleExports;
}

//pulls individual values out of formatting like: ${text} ${value} ${whatever}
//currently used in the TileLayoutTool/Nudge
function templateStringSplit(templateString) {
    var re = /\$\{([^}]+)?\}/g, match;
    var split = new Array;
    while(match = re.exec(templateString)) {
        split.push(match[1]);
    }
    return split;
}


function addClass(cls, classList)
{
    classList = classList || "";
    var classes =classList.split(" ");
    if( classes.indexOf(cls) === -1 )
    {
        classes.push(cls);
    }

    return classes.join(" ");
}

function removeClass(cls, classList)
{
    classList = classList || "";
    var classes = classList.split(" ");
    var idx = classes.indexOf(cls);
    
    idx >= 0 && classes.splice(idx,1);

    return classes.join(" ");   
}


function flattenArray(arrs)
{
    return Array.prototype.concat.apply([], arrs);
}

return {
	DoTween:DoTween,
	BackEaseOut:BackEaseOut,
	BounceEaseOut:BounceEaseOut,
	CircEaseOut:CircEaseOut,
	ExpoEaseOut:ExpoEaseOut,
	SineEaseOut:SineEaseOut,
	getColors:getColors,
	getValue:getValue,
	getValues:getValues,

	copyObject:copyObject,
	clearObject:clearObject,
	mergeObjects:mergeObjects,
	createProxy:createProxy,

    mapFields : mapFields,
	getObjectValue:getObjectValue,
	setObjectValue:setObjectValue,

	calcRect : calcRect,
	objectSort : objectSort,

	areAllFieldsBlank : areAllFieldsBlank,
	isObjectEmpty : isObjectEmpty,

    objectKeysToArray : objectKeysToArray,
    arrayToObject : arrayToObject,
    objectToArray: objectToArray,
	filterObject : filterObject,
	getCallstack : getCallstack,
    getMessageAndStack : getMessageAndStack,
	createId : createId,

	stopEvent: stopEvent,

	PageTransitionData: PageTransitionData,
	TimingData: TimingData,
	CompareVersions: CompareVersions,
	getFunctionSignature : getFunctionSignature,
	getClassName : getClassName,	
	collateModules : collateModules,
    templateStringSplit : templateStringSplit,

    addClass : addClass,
    removeClass : removeClass,

    flattenArray : flattenArray,
    tool_isTool : tool_isTool,
 }



} );