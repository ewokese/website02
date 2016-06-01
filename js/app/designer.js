define(["require", "jquery", "tilex", "render_helper"], function (require, $, tilex, render_helper) {


    var resultTile = new tilex.Tile();


    var snippetDictionary = {};
    var editingSnippet = "";
    var htmldirty = false;
    var pendingLoadSnippetName = null;

    // make a panel with a given id visible
    function ShowPanel(panelid, x, y) {
        var panel = document.getElementById(panelid);
        if (panel) {
            panel.style.visibility = "visible";
        }
    }

    // make a panel with a given id not visible
    function HidePanel(panelid) {
        var panel = document.getElementById(panelid);
        if (panel) {
            panel.style.visibility = "hidden";
        }
    }

    function clearSnippet(force) {

        if (htmldirty && !force) {
            pendingLoadSnippetName = null;
            askOverwrite();
        }
        else {
            var bodyEditor = document.getElementById("htmleditor");
            var nameEditor = document.getElementById("snippetname");
            var tagsEditor = document.getElementById("tags");
            bodyEditor.value = "";
            nameEditor.value = "< enter name >";
            tagsEditor.value = "< enter tags >";
            updateOutput();
            htmldirty = false;
        }
    }

    // load the snippet with the specified name into the editor.
    // if force is true, discard any existing changes
    function loadSnippet(snippetName, force) {

        if (snippetName in snippetDictionary) {

            var snippet = snippetDictionary[snippetName];

            if (htmldirty && !force) {
                pendingLoadSnippetName = snippetName;
                askOverwrite();
            }
            else {

                var bodyEditor = document.getElementById("htmleditor");
                var nameEditor = document.getElementById("snippetname");
                var tagsEditor = document.getElementById("tags");
                bodyEditor.value = snippet.body;
                nameEditor.value = snippet.name;
                if (snippet.tags && snippet.tags.length > 0) {
                    tagsEditor.value = snippet.tags;
                }
                else {
                    tagsEditor.value = "< enter tags >";
                }
                updateOutput();
                htmldirty = false;
            }
        }

    }

    function saveSnippet() {
        if (htmldirty) {
            var s_name = document.getElementById("snippetname").value;
            if (s_name.startsWith("<")) {
                alert("Please enter a name for the snippet");
            }
            else {
                var s_tags = document.getElementById("tags").value;
                if (s_tags.startsWith("<")) {
                    s_tags = "";
                }
                var s_body = document.getElementById("htmleditor").value;
                console.log(s_name + " " + s_body);
                var data =  { "name": s_name, "tags": s_tags, "body": s_body };
                $.post("/api/savesnippet", data);
                snippetDictionary[s_name] = data;
                htmldirty = false;
            }
        }

    }

    function addCSS(cssFile) {

        $('head').append('<link rel="stylesheet" type="text/css" href="css/' + cssFile + '.css">');
    }

    function onCSSChanged(newCSSFile) {
        // remove old one
        $('link[rel=stylesheet]').remove();

        // TODO: add the editor style sheet back in
        //

        if (newCSSFile != "none") {
            // add the new one
            addCSS(newCSSFile);
        }
    }

    function updateOutput() {
        var resultdisplay = document.getElementById("resultdisplay");
        var htmlApplier = new render_helper.HtmlTemplateApplier();
        resultTile.element = resultdisplay;
        var data = document.getElementById("datadefiner").value;
        if (data && data.length > 0) {
            resultTile.data = JSON.parse(data);
        }
        var html = document.getElementById("htmleditor").value;
        resultdisplay.innerHTML = htmlApplier.ApplyTemplateToHTML(html, resultTile.data, resultTile);

    }

    function askOverwrite() {
        ShowPanel("confirmdiscard");
    }



    function init() {

        $.get("/api/getsnippets", function (data) {

            if (data) {
                snippetDictionary = data;
            }
        });



        // buttons
        
        var clearSnippetButton = document.getElementById("newsnippet");
        if (clearSnippetButton) {
            clearSnippetButton.addEventListener("click", function () {
                clearSnippet(false);
            });
        }

        var loadSnippetButton = document.getElementById("loadsnippet");
        if (loadSnippetButton) {
            loadSnippetButton.addEventListener("click", function () {
                //saveSnippet();
            });
        }


        var saveSnippetButton = document.getElementById("savesnippet");
        if (saveSnippetButton) {
            saveSnippetButton.addEventListener("click", function () {
                saveSnippet();
            });
        }


        var namebox = document.getElementById("snippetname");
        if (namebox) {
            namebox.addEventListener("input", function () {
                var s_name = document.getElementById("snippetname").value;
                
            });
            namebox.addEventListener("change", function () {
                var s_name = document.getElementById("snippetname").value;
                if (s_name in snippetDictionary) {
                    // if s_name exists in the snippetDictionary, load it
                    loadSnippet(s_name, false);
                }

            });
        }


        var htmleditor = document.getElementById("htmleditor");
        if (htmleditor) {
            htmleditor.addEventListener("input", function () {
                updateOutput();
                htmldirty = true;
            });
        }

        // add button click handlers
        var tagPanelShowButton = document.getElementById("searchtags");
        if (tagPanelShowButton) {
            tagPanelShowButton.addEventListener("click", function () {
                ShowPanel("tagsearchform", 20, 20)
            });
        }

        var tagPanelHideButton = document.getElementById("hidetagsearchform");
        if (tagPanelHideButton) {
            tagPanelHideButton.addEventListener("click", function () {
                HidePanel("tagsearchform")
            });
        }

        // confirm or cancel discarding changes
        var confirmDiscardButton = document.getElementById("confirmdiscardtrue");
        if (confirmDiscardButton) {
            confirmDiscardButton.addEventListener("click", function () {
                HidePanel("confirmdiscard");
                if (pendingLoadSnippetName) {
                    loadSnippet(pendingLoadSnippetName, true);
                    pendingLoadSnippetName = null;
                }
                else {
                    clearSnippet(true);
                }
            });
        }

        var canceldiscardButton = document.getElementById("canceldiscard");
        if (canceldiscardButton) {
            canceldiscardButton.addEventListener("click", function () {
                HidePanel("confirmdiscard");
            });
        }

        var csspicker = document.getElementById("csspicker");
        if (csspicker) {
            csspicker.addEventListener("change", function () {
                console.log("CSS Changed");
                onCSSChanged(csspicker.value);
                updateOutput();
            });
        }



    }

    return {
        init : init,
    }
});
