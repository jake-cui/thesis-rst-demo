// From CODRA demo
/* This function is activated when (input is entered and) the Create Tree button is clicked:
it parses the json-format string created into an object which is used to make the tree */
var index = 0;
var searchterm = "";
var nucleus_selected = 0;
var satellite_selected = 1;
var nodenum = -1;
var currentjsonstring;
var scrollison = 0;
rhetoricParsingOutput="";

function help(){
    alert(" The width in pixels can be changed by entering a value and clicking Change Width of Tree (px) (a few thousand is a good number). Likewise for the height.f you want to highlight nodes that contain a certain text, or are of a certain relation type, type the text or relation type into the rightmost text area and click the \"Search\" button.To un-highlight all nodes, clear the search box (i.e. the rightmost text area) and uncheck both checkboxes. By hovering the mouse over nodes in the tree, you can access the text on which they are based. The text will display inside a tooltip. Beside the tree, a summary is shown of the text on which the tree is based. The summary can be set to scroll to the most recently clicked node. 		The summary shows, with a solid border, which node was most recently clicked. Its ancestors, right down to the root, appear with a dotted border.");
}
function scrollon()
{
    scrollison = 1;
    document.getElementById("scrolloffradio").checked=false;
}

function scrolloff()
{
    scrollison = 0;
    document.getElementById("scrollonradio").checked=false;
}

function addtext()
{
    var tempinputstring = rhetoricParsingOutput;
    var tempjsonstring = make_JSON_string(tempinputstring);
    currentjsonstring = tempjsonstring;
    var tempjson = JSON.parse(tempjsonstring);
    make_tree(tempjson);
    index=0;
    da=parseNodes(JSON.parse('['+tempjsonstring+']'));
    if (document.getElementById("content").hasChildNodes())
    {
        document.getElementById("content").removeChild(document.getElementById("content").childNodes[0]);
    }
    document.getElementById("content").appendChild(da);
    document.getElementById("content").scrollTop = 0;
    $(removeborder(nodenum + 1));
}

function refreshtext()
{
    var tempjson = JSON.parse(currentjsonstring);
    make_tree(tempjson);
    index=0;
    da=parseNodes(JSON.parse('['+currentjsonstring+']'));
    if (document.getElementById("content").hasChildNodes())
    {
        document.getElementById("content").removeChild(document.getElementById("content").childNodes[0]);
    }
    document.getElementById("content").appendChild(da);

}

// This function is called to start the recursive read function off on the provided input, and feed the json string back to addtext
function make_JSON_string(inputstring)
{
    var jsonstringoutput = "";
    var remaining_input = inputstring.trim();
    nodenum = -1;
    jsonstringoutput += recursiveread(remaining_input);
    return jsonstringoutput;
}

// This function creates a tree-structured json-format string from the output of the rhetorical parser
function recursiveread(inputstring)
{
    nodenum += 1;
    var output = "\n{";

    //Determine the types of the parent
    var spanloc = inputstring.indexOf("span");
    var leafloc = inputstring.indexOf("leaf");
    //This type determines if it's a root or not
    var type;
    //This type (type2) determines if it's a span or a leaf
    var type2;
    if ((spanloc != -1) && ((spanloc < leafloc) || (leafloc == -1)))
    {
        type = inputstring.substring(1, spanloc - 1);

        type = type.trim();
        type2 = "span";

    }
    else if ((leafloc != -1) && ((spanloc > leafloc) || (spanloc == -1)))
    {
        type = inputstring.substring(1, leafloc - 1);
        type = type.trim();
        type2 = "leaf";

    }

    //Use parent type to determine what to do next
    if (type == "Root")
    {

        //Add name and 1 bracket of metatext to output
        var txt = inputstring.substring(inputstring.indexOf(type), inputstring.indexOf(")") + 1);
        output += "\n\"name\" : \"" + nodenum + "ENDNODENUM" + txt + "\"";
        output += ",\n\"children\" : \n[";

        //Call recursively on children
        //Set initial current location to just after root metatext
        var currentloc = inputstring.indexOf(")") + 1;
        var parentcloseloc = find_closed_bracket(inputstring);

        //Find appropriate initial open location
        var childopenloc = (inputstring.substring(currentloc, parentcloseloc + 1)).indexOf("(") + currentloc;
        var done = 0;
        var count = 0;
        //TODO: take into account quoted brackets?
        while (done != 1)
        {

            //Find and set childcloseloc
            var childcloseloc = find_closed_bracket(inputstring.substring(childopenloc, parentcloseloc + 1)) + childopenloc;
            // Recursive call
            var childjsondata = recursiveread(inputstring.substring(childopenloc, childcloseloc + 1));
            // console.log(childjsondata);
            // console.log('child');
            if (count > 0)
            {
                output += ",";
            }
            output += childjsondata;

            //Set new currentloc to the location just after the closed bracket of the current child
            currentloc = childcloseloc + 1;
            // Check if there are no more children of the parent
            if (((inputstring.substring(currentloc, parentcloseloc + 1)).indexOf("(")) == -1)
            {
                done = 1;
            }
            else
            {
                //Set new childopenloc to the location of the next open bracket between the end of the current child's bracket and the end of the root's bracket
                childopenloc = (inputstring.substring(currentloc, parentcloseloc + 1)).indexOf("(") + currentloc;
            }

            count++;
        }

        output += "\n]";

    }
    else if ((type == "Satellite") || (type == "Nucleus") || (type == "DUMMY"))
    {

        //Read name and 2 brackets of metatext to output (don't close quotation mark on name field yet - more text is to be added)

        //Decide what to do next on the basis of 2nd level type
        if (type2 == "leaf")
        {
            var txt = inputstring.substring(inputstring.indexOf(type), (inputstring.substring(inputstring.indexOf(")") + 1, inputstring.length)).indexOf(")") + 2 + inputstring.indexOf(")"));
            output += "\n\"name\" : \"" + nodenum + "ENDNODENUM" + txt;

            var contained_text_startloc = inputstring.indexOf("text _!") + 7;
            var contained_text_endloc = (inputstring.substring(contained_text_startloc, inputstring.length)).indexOf("_!") + contained_text_startloc;
            var contained_text = inputstring.substring(contained_text_startloc, contained_text_endloc);
            //Close quotation mark on name field

            var text_to_be_added = " | Text: " + contained_text + " \"";
            output += text_to_be_added;
            output += ",\n\"text\" : \"" + contained_text.replace(/\s+(\W)/g, "$1") + "\"";
            output += ",\n\"id\" : " + nodenum ;
            output += ",\n\"isLeaf\" : " + 1 ;

        }
        else if (type2 == "span")
        {
            //Read name and 2 brackets of metatext to output
            var txt = inputstring.substring(inputstring.indexOf(type), (inputstring.substring(inputstring.indexOf(")") + 1, inputstring.length)).indexOf(")") + 2 + inputstring.indexOf(")"));
            output += "\n\"name\" : \"" + nodenum + "ENDNODENUM" + txt + "\"";
            console.log("txt is " + txt);
            var cut_text = txt.substring(txt.indexOf("span "),txt.indexOf("(rel2"));
            cut_text = cut_text.substring(4, cut_text.length-2);
            var bounds = cut_text.trim().split(" ");
            console.log(bounds);
            var span_len = parseInt(bounds[1]) - parseInt(bounds[0]);
            console.log(span_len);
            output += ",\n\"size\" : " + span_len ;
            output += ",\n\"id\" : " + nodenum ;
            output += ",\n\"isLeaf\" : " + 0 ;
            output += ",\n\"children\" : \n[";

            //Call recursively on children
            //Set initial current location to just after 2nd bracket of metatext
            var currentloc = (inputstring.substring(inputstring.indexOf(")") + 1, inputstring.length)).indexOf(")") + 1 + inputstring.indexOf(")");

            var parentcloseloc = find_closed_bracket(inputstring);

            //Find appropriate initial open location
            var childopenloc = (inputstring.substring(currentloc, parentcloseloc + 1)).indexOf("(") + currentloc;
            //TODO: take into account quoted brackets?
            var done = 0;
            var count = 0;
            while (done != 1)
            {
                //Find and set childcloseloc
                var childcloseloc = find_closed_bracket(inputstring.substring(childopenloc, parentcloseloc + 1)) + childopenloc;

                // Recursive call
                var childjsondata = recursiveread(inputstring.substring(childopenloc, childcloseloc + 1));
                if (count > 0)
                {
                    output += ",";
                }
                output += childjsondata;

                //Set new currentloc to the location just after the closed bracket of the current child
                currentloc = childcloseloc + 1;
                // Check if there are no more children of the parent
                if (((inputstring.substring(currentloc, parentcloseloc + 1)).indexOf("(")) == -1)
                {
                    done = 1;
                }
                else
                {
                    //Set new childopenloc to the location of the next open bracket between the end of the current child's bracket and the end of the root's bracket
                    childopenloc = (inputstring.substring(currentloc, parentcloseloc + 1)).indexOf("(") + currentloc;
                }

                count++;
            }

            output += "\n]";

        }

    }

    output += "\n}";
    return output;
}

// This function returns the index of the closed-bracket that matches (i.e. closes) the first open-bracket found in the input
// TODO: make function work with quoted brackets?
function find_closed_bracket(input)
{
    // The number of open brackets not closed currently
    bracket_count = 0;
    // The location of the closed bracket of the first open bracket in the input, within the remaining input
    location_of_closed = 0;
    /* The amount of input discarded so far. Also, the value that needs to be added to any value that refers to a
     position within the remaining input, in order to obtain a position within the total input. */
    var current_base_index = 0;
    // The amount of input left to be considered
    var remaining_input = input;
    // This var is set to 1 to signal that no closed bracket has been found for the first open bracket in the input
    var errorboolean = 0;
    /* This var is set to 1 to signal that the first open bracket in the input has been found;
     after this, the while loop will search for the matching closed bracket */
    var first_open_bracket_found = 0;

    while (true)
    {
        var nextopen = remaining_input.indexOf("(");
        var nextclosed = remaining_input.indexOf(")");
        // If the next bracket is an open bracket:
        if ((nextopen < nextclosed) && (nextopen != -1) && (nextclosed != -1))
        {
            first_open_bracket_found = 1;
            bracket_count++;
            remaining_input = remaining_input.substring(nextopen + 1, remaining_input.length);
            current_base_index += nextopen + 1;
        }
        // If the next bracket is a closed bracket or there is no open bracket:
        else if (((nextopen > nextclosed) || (nextopen == -1)) && (nextclosed != -1))
        {
            // If we're in the active portion of the search for a closed bracket, because we've found the first open bracket:
            if (first_open_bracket_found)
            {
                bracket_count--;
                // If we've found the closed bracket that matches the first open bracket in the input:
                if (bracket_count == 0)
                {
                    location_of_closed = nextclosed;
                    break;
                }
                // If we haven't found the result, we keep looking:
                else
                {
                    remaining_input = remaining_input.substring(nextclosed + 1, remaining_input.length);
                    current_base_index += nextclosed + 1;
                }
            }
            // If we haven't yet found the first open bracket:
            else
            {
                remaining_input = remaining_input.substring(nextclosed + 1, remaining_input.length);
                current_base_index += nextclosed + 1;
            }

        }
        else if (nextclosed == -1)
        {
            errorboolean = 1;
            break;
        }
    }

    if (errorboolean == 0)
        return (location_of_closed + current_base_index);
    else
        return "BADFORMATERROR";
}
//////////////////////////////////////////////////

function make_tree(json) {
    json.x0 = 800;
    json.y0 = 0;
    update(root = json);
}

function update(source) {

    // Compute the new tree layout.
    var nodes = tree.nodes(root).reverse();
    // console.log(nodes)
    // Update the nodes…
    var node = vis.selectAll("g.node").data(nodes, function(d) {
        return d.id || (d.id = ++i);
    });

    var nodeEnter = node.enter().append("svg:g").attr("class", "node").attr("transform", function(d) {
        return "translate(" + source.y0 + "," + source.x0 + ")";
    });
    //.style("opacity", 1e-6);

    // Enter any new nodes at the parent's previous position.

    nodeEnter.append("svg:circle")
    //.attr("class", "node")
    //.attr("cx", function(d) { return source.x0; })
    //.attr("cy", function(d) { return source.y0; })
        .attr("r", 4.5).style("fill", function(d) {
        return d._children ? "lightsteelblue" : "#fff";
    }).on("click", click).append("title").text(function(d) {
        // Uncomment to make tooltip only show text in case of leaf
        /*if (d.name.indexOf("| Text: ") != -1) {return d.name.substring(d.name.indexOf("| Text: ") + 1, d.name.length);}
        else {*/
        return d.name.substring(d.name.indexOf("ENDNODENUM")+10,d.name.length);
        /*}*/
    });


    // Comment out block to remove text next to nodes
    nodeEnter.append("svg:text").attr("x", function(d) {
        return d._children ? -8 : 8;
    }).attr("y", 3)
    //.attr("fill","#ccc")
    //.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
        .text(function(d) {
            if(d.children) {
                relation="";
                for(j=0;j<d.children.length;j++){
                    if(d.children[j].name.indexOf("rel2par ")>0){
                        tempStr=d.children[j].name.substring(d.children[j].name.indexOf("rel2par ")+8,d.children[j].name.length);
                        //alert(tempStr);
                        if(tempStr.indexOf("span")<0)
                            relation=tempStr.substring(0,tempStr.indexOf(")"))+" ";
                        //alert(relation+""+ d.children[j].name);
                    }
                }

                //alert("Done"+ d.name+", "+relation);
                if(relation=="") alert("No relation found for"+d.name);
                else return relation;
            }
            if (d.name.indexOf("| Text: ") != -1) {return " "+d.name.substring(d.name.indexOf("| Text: ") + 7, d.name.length >20? d.name.indexOf("| Text: ") + 25: d.name.length)+"...";}
            else{
                var str= " "+d.name.substring(d.name.indexOf("ENDNODENUM")+10,d.name.indexOf(" "));
                str+="("+d.name.substring(d.name.lastIndexOf("(")+9,d.name.lastIndexOf(")")+1)
                return str;
                //return d.name.substring(d.name.indexOf("ENDNODENUM")+10,d.name.length);

            }
        });


    // Transition nodes to their new position.
    nodeEnter.transition().duration(duration).attr("transform", function(d) {
        return "translate(" + d.y + "," + d.x + ")";
    }).style("opacity", 1).select("circle")
    //.attr("cx", function(d) { return d.x; })
    //.attr("cy", function(d) { return d.y; })
        .style("fill", "lightsteelblue");

    // Translates the nodes and colors them based on whether their children are shown
    var nodeUpdate = node.transition().duration(duration).attr
    (
        "transform", function(d)
        {
            return "translate(" + d.y + "," + d.x + ")";
        }
    ).style("opacity", 1).select("circle").attr("r", 9).style("fill", function(d) {
        var containedtext = d.name.substring(d.name.indexOf("ENDNODENUM")+10,d.name.length);
        if (((containedtext.indexOf(searchterm) != -1) && (searchterm != "")) || (satellite_selected == 1 && containedtext.indexOf("Satellite") != -1) || (nucleus_selected == 1 && containedtext.indexOf("Nucleus") != -1))
        {
            return "rgb(241, 163, 64)";
        }
        else
        {
            return d._children ? "blue" : "lightsteelblue";
        }
    });

    // Makes sub-tree disappear
    node.exit().transition().duration(duration).attr("transform", function(d) {
        return "translate(" + source.y + "," + source.x + ")";
    }).style("opacity", 1e-6).remove();






    /*
    var nodeTransition = node.transition()
    .duration(duration);

    nodeTransition.select("circle")
    .attr("cx", function(d) { return d.y; })
    .attr("cy", function(d) { return d.x; })
    .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

    nodeTransition.select("text")
    .attr("dx", function(d) { return d._children ? -8 : 8; })
    .attr("dy", 3)
    .style("fill", function(d) { return d._children ? "lightsteelblue" : "#5babfc"; });

    // Transition exiting nodes to the parent's new position.
    var nodeExit = node.exit();

    nodeExit.select("circle").transition()
    .duration(duration)
    .attr("cx", function(d) { return source.y; })
    .attr("cy", function(d) { return source.x; })
    .remove();

    nodeExit.select("text").transition()
    .duration(duration)
    .remove();
    */
    // Update the links…
    var link = vis.selectAll("path.link").data(tree.links(nodes), function(d) {
        return d.target.id;
    });

    // Enter any new links at the parent's previous position.
    link.enter().insert("svg:path", "g").attr("class", "link").attr("d", function(d) {
        var o = {
            x : source.x0,
            y : source.y0
        };
        return diagonal({
            source : o,
            target : o
        });
    }).transition().duration(duration).attr("d", diagonal);

    // Transition links to their new position.
    link.transition().duration(duration).attr("d", diagonal);

    // Transition exiting nodes to the parent's new position.
    link.exit().transition().duration(duration).attr("d", function(d) {
        var o = {
            x : source.x,
            y : source.y
        };
        return diagonal({
            source : o,
            target : o
        });
    }).remove();

    // Stash the old positions for transition.
    nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });
}

// Toggle children on click.
function click(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
        $(removeborder(nodenum + 1));
        $(createborder(d.name.substring(0, d.name.indexOf("ENDNODENUM"))));
        borderparents(d.name.substring(0, d.name.indexOf("ENDNODENUM")), JSON.parse('['+currentjsonstring+']'));
    } else {
        d.children = d._children;
        d._children = null;
        $(removeborder(nodenum + 1));
        $(createborder(d.name.substring(0, d.name.indexOf("ENDNODENUM"))));
        borderparents(d.name.substring(0, d.name.indexOf("ENDNODENUM")), JSON.parse('['+currentjsonstring+']'));
    }
    update(d);
    if (scrollison)
    {
        window.location = "#" + d.name.substring(0, d.name.indexOf("ENDNODENUM"));
    }
}





////////////////// FOCUS WINDOW CODE //////////////////

var first=1;
function parseNodes(nodes) { // takes a nodes array and turns it into a <ol>
    var ol = document.createElement("ul");
    if(first==1)
    {
        ol.setAttribute('id','comments');

        first=0;
    }
    else{
        ol.setAttribute('class','children');
    }
    for(var i=0; i<nodes.length; i++) {
        ol.appendChild(parseNode(nodes[i]));
    }
    return ol;
}

function parseNode(node) { // takes a node object and turns it into a <li>
    var li = document.createElement("LI");
    li.setAttribute('id',index/*node.commentid*/);

    /*var text="<div class=\"comment\" "+"id=\"div"+node.commentid+"\" style=\"border:"+"0px;\">"+"<p>"+
                     node.title+
                    "</p></div>";*/
    var text="<div class=\"comment\""+"id=\"div"+index/*node.commentid */
        +"\" style=\"border:"+"2px;\">"+

        "<p>"+
        node.name.substring(node.name.indexOf("ENDNODENUM")+10, node.name.length)+
        "</p>"+
        "</div>";
    index++;
    // alert(text);
    li.innerHTML = text;

    if(node.children) li.appendChild(parseNodes(node.children));
    return li;
}

function borderparents(nodenum, currentnodes)
{
    //Go through each node in level
    for (var i = 0; i < currentnodes.length; i++)
    {
        // If the sought node has been found among current nodes
        if (currentnodes[i].name.substring(0, currentnodes[i].name.indexOf("ENDNODENUM")) == nodenum)
        {
            // Border the parents by returning a 1 to caller
            return 1;
        }
    }
    // Otherwise, call recursively on descendants of current nodes (if they have any)
    for (var j = 0; j < currentnodes.length; j++)
    {
        if (currentnodes[j].children)
        {
            var result = borderparents(nodenum, currentnodes[j].children);
            // If this node is a parent of the sought node
            if (result == 1)
            {
                // Border this parent
                createdottedborder(currentnodes[j].name.substring(0, currentnodes[j].name.indexOf("ENDNODENUM")));
                // And border all its parents
                return 1;
            }
        }
    }
    return 0;
}

var test_string2 = "( Root (span 1 27)( Nucleus (leaf 1) (rel2par TextualOrganization) (text _!Gallery unveils interactive tree_!) )( Nucleus (span 2 27) (rel2par TextualOrganization)( Nucleus (span 2 23) (rel2par span)( Nucleus (span 2 21) (rel2par span)( Nucleus (span 2 19) (rel2par span)( Nucleus (span 2 10) (rel2par span)( Nucleus (span 2 4) (rel2par span)( Nucleus (span 2 3) (rel2par Same-Unit)( Nucleus (leaf 2) (rel2par span) (text _!A Christmas tree_!) )( Satellite (leaf 3) (rel2par Elaboration) (text _!that can receive text messages_!) ))( Nucleus (leaf 4) (rel2par Same-Unit) (text _!has been unveiled at London 's Tate Britain art gallery ._!) ))( Satellite (span 5 10) (rel2par Elaboration)( Nucleus (span 5 7) (rel2par span)( Nucleus (leaf 5) (rel2par span) (text _!The spruce has an antenna_!) )( Satellite (span 6 7) (rel2par Elaboration)( Nucleus (leaf 6) (rel2par span) (text _!which can receive Bluetooth texts_!) )( Satellite (leaf 7) (rel2par Elaboration) (text _!sent by visitors to the Tate ._!) )))( Satellite (span 8 10) (rel2par Elaboration)( Nucleus (leaf 8) (rel2par span) (text _!The messages will be \\\" unwrapped \\\"_!) )( Satellite (span 9 10) (rel2par Manner-Means)( Nucleus (leaf 9) (rel2par span) (text _!by sculptor Richard Wentworth ,_!) )( Satellite (leaf 10) (rel2par Elaboration) (text _!who is responsible for decorating the tree with broken plates and light bulbs ._!) )))))( Satellite (span 11 19) (rel2par Elaboration)( Nucleus (span 11 17) (rel2par span)( Nucleus (span 11 15) (rel2par span)( Nucleus (span 11 13) (rel2par span)( Nucleus (leaf 11) (rel2par span) (text _!It is the 17th year_!) )( Satellite (span 12 13) (rel2par Elaboration)( Nucleus (leaf 12) (rel2par span) (text _!that the gallery has invited an artist_!) )( Satellite (leaf 13) (rel2par Enablement) (text _!to dress their Christmas tree ._!) )))( Satellite (span 14 15) (rel2par Elaboration)( Nucleus (leaf 14) (rel2par span) (text _!Artists_!) )( Satellite (leaf 15) (rel2par Elaboration) (text _!who have decorated the Tate tree in previous years include Tracey Emin in 2002 ._!) )))( Satellite (span 16 17) (rel2par Elaboration)( Satellite (leaf 16) (rel2par Attribution) (text _!The plain green Norway_!) )( Nucleus (leaf 17) (rel2par span) (text _!spruce is displayed in the gallery 's foyer ._!) )))( Satellite (span 18 19) (rel2par Elaboration)( Satellite (leaf 18) (rel2par Background) (text _!Its light bulb adornments are dimmed ,_!) )( Nucleus (leaf 19) (rel2par span) (text _!ordinary domestic ones joined together with string ._!) ))))( Satellite (span 20 21) (rel2par Elaboration)( Satellite (leaf 20) (rel2par Attribution) (text _!The plates_!) )( Nucleus (leaf 21) (rel2par span) (text _!decorating the branches will be auctioned off for the children 's charity ArtWorks ._!) )))( Satellite (span 22 23) (rel2par Elaboration)( Nucleus (leaf 22) (rel2par span) (text _!Wentworth worked as an assistant_!) )( Satellite (leaf 23) (rel2par Enablement) (text _!to sculptor Henry Moore in the late 1960s ._!) )))( Satellite (span 24 27) (rel2par Elaboration)( Nucleus (span 24 25) (rel2par span)( Nucleus (leaf 24) (rel2par Temporal) (text _!His reputation as a sculptor grew in the 1980s ,_!) )( Nucleus (leaf 25) (rel2par Temporal) (text _!while he has been one of the most influential teachers during the last two decades ._!) ))( Satellite (span 26 27) (rel2par Elaboration)( Nucleus (leaf 26) (rel2par span) (text _!Wentworth is also known for his photography of mundane , everyday subjects such as a cigarette packet_!) )( Satellite (leaf 27) (rel2par Elaboration) (text _!jammed under the wonky leg of a table ._!) )))))";

var test_string = "( Root (span 1 38)( Nucleus (span 1 34) (rel2par span)( Nucleus (span 1 28) (rel2par span)( Nucleus (span 1 27) (rel2par span)( Nucleus (span 1 7) (rel2par span)( Nucleus (span 1 3) (rel2par span)( Nucleus (leaf 1) (rel2par span) (text _!The European Parliament has thrown out a bill_!) )( Satellite (span 2 3) (rel2par Elaboration)( Nucleus (leaf 2) (rel2par span) (text _!that would have allowed software_!) )( Satellite (leaf 3) (rel2par Elaboration) (text _!to be patented ._!) )))( Satellite (span 4 7) (rel2par Elaboration)( Nucleus (leaf 4) (rel2par Joint) (text _!Politicians unanimously rejected the bill_!) )( Nucleus (span 5 7) (rel2par Joint)( Nucleus (leaf 5) (rel2par span) (text _!and now it must go through another round of consultation_!) )( Satellite (span 6 7) (rel2par Condition)( Nucleus (leaf 6) (rel2par span) (text _!if it is to have a chance_!) )( Satellite (leaf 7) (rel2par Elaboration) (text _!of becoming law ._!) )))))( Satellite (span 8 27) (rel2par Elaboration)( Nucleus (leaf 8) (rel2par span) (text _!During consultation the software patents bill could be substantially re-drafted or even scrapped ._!) )( Satellite (span 9 27) (rel2par Explanation)( Nucleus (span 9 12) (rel2par span)( Nucleus (leaf 9) (rel2par span) (text _!The bill was backed by some hi-tech firms ,_!) )( Satellite (span 10 12) (rel2par Elaboration)( Satellite (leaf 10) (rel2par Attribution) (text _!saying_!) )( Nucleus (span 11 12) (rel2par span)( Nucleus (leaf 11) (rel2par span) (text _!they needed protections_!) )( Satellite (leaf 12) (rel2par Elaboration) (text _!it offered to make research worthwhile ._!) ))))( Satellite (span 13 27) (rel2par Elaboration)( Nucleus (span 13 16) (rel2par span)( Nucleus (leaf 13) (rel2par span) (text _!Hugo Lueders , European director for public policy at CompTIA , an umbrella organization for technology companies ,_!) )( Satellite (span 14 16) (rel2par Attribution)( Nucleus (span 14 15) (rel2par Same-Unit)( Nucleus (leaf 14) (rel2par span) (text _!said only_!) )( Satellite (leaf 15) (rel2par Background) (text _!when intellectual property was adequately protected_!) ))( Nucleus (leaf 16) (rel2par Same-Unit) (text _!would European inventors prosper ._!) )))( Satellite (span 17 27) (rel2par Explanation)( Nucleus (span 17 19) (rel2par span)( Satellite (leaf 17) (rel2par Attribution) (text _!He said_!) )( Nucleus (span 18 19) (rel2par span)( Nucleus (leaf 18) (rel2par span) (text _!the benefits of the bill had been obscured by special interest groups_!) )( Satellite (leaf 19) (rel2par Elaboration) (text _!which muddied debate over the rights and wrongs of software patents ._!) )))( Satellite (span 20 27) (rel2par Elaboration)( Satellite (span 20 23) (rel2par Contrast)( Satellite (leaf 20) (rel2par Attribution) (text _!Other proponents of the bill said_!) )( Nucleus (span 21 23) (rel2par span)( Nucleus (leaf 21) (rel2par span) (text _!it was a good compromise_!) )( Satellite (span 22 23) (rel2par Elaboration)( Nucleus (leaf 22) (rel2par span) (text _!that avoided the excesses of the American system_!) )( Satellite (leaf 23) (rel2par Elaboration) (text _!which allows the patenting of business practices as well as software ._!) ))))( Nucleus (span 24 27) (rel2par span)( Satellite (leaf 24) (rel2par Attribution) (text _!But opponents of the bill said_!) )( Nucleus (span 25 27) (rel2par span)( Nucleus (leaf 25) (rel2par Contrast) (text _!that it could stifle innovation ,_!) )( Nucleus (span 26 27) (rel2par Contrast)( Nucleus (leaf 26) (rel2par Joint) (text _!be abused by firms keen to protect existing monopolies_!) )( Nucleus (leaf 27) (rel2par Joint) (text _!and could hamper the growth of the open source movement ._!) ))))))))))( Satellite (leaf 28) (rel2par Elaboration) (text _!The proposed law had a troubled passage through the European parliament ._!) ))( Satellite (span 29 34) (rel2par Elaboration)( Nucleus (span 29 31) (rel2par span)( Nucleus (leaf 29) (rel2par span) (text _!Its progress was delayed twice_!) )( Satellite (span 30 31) (rel2par Background)( Nucleus (leaf 30) (rel2par span) (text _!when Polish MEPs rejected plans_!) )( Satellite (leaf 31) (rel2par Elaboration) (text _!to adopt it ._!) )))( Satellite (span 32 34) (rel2par Elaboration)( Nucleus (leaf 32) (rel2par Same-Unit) (text _!Also earlier this month the influential European Legal Affairs Committee_!) )( Nucleus (span 33 34) (rel2par Same-Unit)( Satellite (leaf 33) (rel2par Attribution) (text _!( JURI ) said_!) )( Nucleus (leaf 34) (rel2par span) (text _!the law should be re-drafted after it failed to win the support of MEPs ._!) )))))( Satellite (span 35 38) (rel2par Elaboration)( Nucleus (span 35 36) (rel2par span)( Satellite (leaf 35) (rel2par Enablement) (text _!To become law_!) )( Nucleus (leaf 36) (rel2par span) (text _!both the European Parliament and a qualified majority of EU states have to approve of the draft wording of the bill ._!) ))( Satellite (span 37 38) (rel2par Elaboration)( Satellite (leaf 37) (rel2par Attribution) (text _!The latest rejection means_!) )( Nucleus (leaf 38) (rel2par span) (text _!that now the bill on computer inventions must go back to the EU for re-consideration ._!) ))))";
var new_string = JSON.parse(make_JSON_string(test_string2));
console.log(new_string);
document.getElementById("json").innerHTML = JSON.stringify(new_string, undefined, 2);

// document.getElementById("json").innerHTML = new_string;
//
// function getNodes(object) {
//     return Object
//         .entries(object)
//         .map(([key, value]) => value && typeof value === 'object'
//             ? { title: key, key, children: getNodes(value) }
//             : { title: key, key, value }
//         );
// }function getNodes(object) {
//     return Object
//         .entries(object)
//         .map(([key, value]) => value && typeof value === 'object'
//             ? { title: key, key, children: getNodes(value) }
//             : { title: key, key, value }
//         );
// }

// var traverse = require('traverse');

node_map = {};
var counter = 1;
leaves = {};

function traverse(o) {
    for (var i in o) {
        if (!!o[i] && typeof(o[i])=="object" ) {
            if(i != "children") {
                // continue;
                // console.log(o[i]);
                node_map[counter] = o[i];

                if(o[i]["isLeaf"]) {
                    leaves[counter] = o[i];
                }
                counter += 1;

            }
            // i == children, o is a parent object
            else {
                // for (var temp in o[i]) {
                //     // o[i][temp]["parent"] = o;
                // }
                // console.log("i is " +i);
                // console.log("o is");
                // console.log(o);

                // Store both parents and siblings of each node
                o["children"][0]["parent"] = o["id"];
                o["children"][0]["sibling"] = o["children"][1]["id"];

                o["children"][1]["parent"] = o["id"];
                o["children"][1]["sibling"] = o["children"][0]["id"];

                console.log("else case");
                console.log(o["children"][0]);
            }

            // console.log(i, o[i]);
            // console.log("i is " + i);
            // console.log(o[i].length);
            traverse(o[i]);
        }
    }
    return node_map;
}
console.log('start traverse');
traverse(new_string);

console.log(node_map);
console.log(leaves);

window.leavesTest = leaves;
// export {leaves};