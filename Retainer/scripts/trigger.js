var sandbox = true;
var mode;

$(document).ready( function() {
var retainerLocation = "Retainer/";
// $('#send_to_tutorial_button').click(function() {
//     clearQueue('https://roc.cs.rochester.edu/convInterface/videocoding/tutorial/tutorial.php?justTutorial=true');
// });

var sessionLoaded = false;

updateSessionsList();
$("#updateTask").hide();
setInterval(function(){updateSessionsList()},30000);

function updateSessionsList(){
    $.ajax({
        url: retainerLocation + "php/getSessionsList.php",
        type: "POST",
        data: {},
        dataType: "json",
        success: function(d) {
            $("#taskSessionLoad").empty();
            for(var i = 0; i < d.length; i++) {
                var obj = d[i];
                var task = d[i].task;
                $("#taskSessionLoad").append("<option>" + task + "</option>");
            }
            $("#taskSessionLoad").val($("#taskSession").val());
        },
        fail: function() {
            alert("Sending number of workers failed");
        }
    });
}


$("#addNewTask").on("click", function(event){
    event.preventDefault();
    sessionLoaded = true;
    $.ajax({
        url: retainerLocation + "php/addNewTask.php",
        type: "POST",
        async: false,
        data: {taskTitle: $("#hitTitle").val(), taskDescription: $("#hitDescription").val(), taskKeywords: $("#hitKeywords").val(), task: $("#taskSession").val(), country: $("#country").val(), percentApproved: $("#percentApproved").val()},
        dataType: "text",
        success: function(d) {
            // $('#loadTask').attr('disabled','disabled');
            $('#addNewTask').attr('disabled','disabled');
            $('#updateTask').removeAttr('disabled');
            // $("#taskSessionLoad").val($("#taskSession").val());
            // $('#taskSessionLoad').attr('disabled','disabled');
            $('#taskSession').attr('disabled','disabled');

            $("#taskSessionLoad").append("<option>" + $("#taskSession").val() + "</option>");
            $("#taskSessionLoad").val($("#taskSession").val());

            $("#updateTask").show();
            $('#addNewTask').hide();

        },
        fail: function() {
            alert("Sending number of workers failed");
        }
    });
});

$("#minPrice,#maxPrice").on("change", function(event){
    event.preventDefault();
    $.ajax({
        url: retainerLocation + "php/updatePrice.php",
        type: "POST",
        async: true,
        data: {task: $("#taskSession").val(), min_price: $("#minPrice").val(), max_price: $("#maxPrice").val()},
        dataType: "text",
        success: function(d) {
            
        },
        fail: function() {
            alert("Sending number of workers failed");
        }
    });
});

$("#currentTarget").change(function(){

    $.ajax({
        url: retainerLocation + "php/updateTargetNumWorkers.php",
        type: "POST",
        async: true,
        data: {task: $("#taskSession").val(), target_workers: $("#currentTarget").val()},
        dataType: "text",
        success: function(d) {
            
        },
        fail: function() {
            alert("Sending number of workers failed");
        }
    });

    // if($("#currentTarget").val() <= 0){
    //     $('#stopRecruiting').attr('disabled','disabled');
    //     $('#startRecruiting').removeAttr('disabled');
    // }
});

$("#stopRecruiting").on("click", function(event){
    event.preventDefault();
    $.ajax({
        url: retainerLocation + "php/stopRecruiting.php",
        type: "POST",
        async: true,
        data: {task: $("#taskSession").val()},
        dataType: "text",
        success: function(d) {
            
        },
        fail: function() {
            alert("Sending number of workers failed");
        }
    });

    $('#startRecruiting').html('Please wait while recruiting is stopped');
    $('#stopRecruiting').attr('disabled','disabled');
    // $('#startRecruiting').removeAttr('disabled');

    $('#yesSandbox').removeAttr('disabled');
    $('#noSandbox').removeAttr('disabled');
});

$("#startRecruiting").on("click", function(event){
    event.preventDefault();

    var problem = validateTaskInfo();
    if(problem != ""){
        alert("ERROR: please update " + problem);
    }
    else {
        // Update db, mark ok to recruit
        $.ajax({
            url: retainerLocation + "php/startRecruiting.php",
            type: "POST",
            async: false,
            data: {task: $("#taskSession").val()},
            dataType: "text",
            success: function(d) {
                
            },
            fail: function() {
                alert("Sending number of workers failed");
            }
        });

        if(mode == "retainer"){
            // Start the recruiting tool
            $.ajax({
                url: "Overview/turk/getAnswers.php",
                type: "POST",
                async: true,
                data: {task: $("#taskSession").val(), useSandbox: sandbox, accessKey: $("#accessKey").val(), secretKey: $("#secretKey").val(), mode: "retainer"},
                dataType: "text",
                success: function(d) {
                    alert(d);
                    alert("Recruiting stopped");
                    $('#startRecruiting').removeAttr('disabled');
                    $('#startRecruiting').html('Start recruiting');
                },
                fail: function() {
                    alert("Sending number of workers failed");
                }
            });
        }

        $('#startRecruiting').attr('disabled','disabled');
        $('#stopRecruiting').removeAttr('disabled');

        $('#yesSandbox').attr('disabled','disabled');
        $('#noSandbox').attr('disabled','disabled');
    }

});

$("#postHITs").on("click", function(event){
    event.preventDefault();

    var problem = validateTaskInfo();
    if(problem != ""){
        alert("ERROR: please update " + problem);
    }
    else {
        if(mode == "direct"){
            var urlEscaped = $("#sendToURL").val().split("&").join("&amp;&amp;");
            // alert(urlEscaped);
            // Start the recruiting tool

            $('#postHITs').attr('disabled','disabled');
            $('#postHITs').text("Posting...");
            $('#expireHITs').attr('disabled','disabled');

            $.ajax({
                url: "Overview/turk/getAnswers.php",
                type: "POST",
                async: true,
                data: {task: $("#taskSession").val(), useSandbox: sandbox, accessKey: $("#accessKey").val(), secretKey: $("#secretKey").val(), mode: "direct", URL: urlEscaped, price: $("#price").val(), numHITs: $("#numHITs").val(), numAssignments: $("#numAssignments").val()},
                dataType: "text",
                success: function(d) {
                    // alert(d);
                    alert("HITs posted");
                    $('#postHITs').text("Posted " + $("#numHITs").val() + " HITs");
                    $('#postHITs').removeAttr('disabled');
                    $('#expireHITs').removeAttr('disabled');
                },
                fail: function() {
                    alert("Sending number of workers failed");
                }
            });
        }

        // $('#yesSandbox').attr('disabled','disabled');
        // $('#noSandbox').attr('disabled','disabled');
    }

});

$("#expireHITs").on("click", function(event){
    event.preventDefault();

    $('#postHITs').attr('disabled','disabled');
    $('#expireHITs').attr('disabled','disabled');
    $('#expireHITs').text("Expiring...");

    $.ajax({
        url: "Overview/turk/expireHITs.php",
        type: "POST",
        async: true,
        data: {task: $("#taskSession").val(), useSandbox: sandbox, accessKey: $("#accessKey").val(), secretKey: $("#secretKey").val()},
        dataType: "text",
        success: function(d) {
            // alert(d);
            alert("HITs expired");
            $('#expireHITs').text("Expire All HITs");
            $('#postHITs').removeAttr('disabled');
            $('#expireHITs').removeAttr('disabled');
        },
        fail: function() {
            alert("Sending number of workers failed");
        }
    });

        // $('#yesSandbox').attr('disabled','disabled');
        // $('#noSandbox').attr('disabled','disabled');
});

$("#taskSessionLoad").on("change", function(event){
    event.preventDefault();

    sessionLoaded = true;

    var taskData;
    $.ajax({
        url: retainerLocation + "php/loadTask.php",
        type: "POST",
        async: false,
        data: {task: $("#taskSessionLoad").val()},
        dataType: "json",
        success: function(d) {
            taskData = d;
        },
        fail: function() {
            alert("Sending number of workers failed");
        }
    });

    $("#taskSession").val(taskData.task);
    $("#hitTitle").val(taskData.task_title);
    $("#hitDescription").val(taskData.task_description);
    $("#hitKeywords").val(taskData.task_keywords);
    $("#minPrice").val(taskData.min_price);
    $("#maxPrice").val(taskData.max_price);
    $("#currentTarget").val(taskData.target_workers);
    $("#country").val(taskData.country);
    $("#percentApproved").val(taskData.percentApproved);
    $("#waitingInstructions").val(taskData.instructions);

    $('#addNewTask').attr('disabled','disabled');
    // $('#loadTask').attr('disabled','disabled');
    // $('#taskSessionLoad').attr('disabled','disabled');
    $('#taskSession').attr('disabled','disabled');
    $('#updateTask').removeAttr('disabled');

    $("#updateTask").show();
    $('#addNewTask').hide();

    if(taskData.done == "1"){
        $('#stopRecruiting').attr('disabled','disabled');
        $('#startRecruiting').removeAttr('disabled');
    }
    else if(taskData.done == "0"){
        $('#startRecruiting').attr('disabled','disabled');
        $('#stopRecruiting').removeAttr('disabled');
    }


});

$("#updateTask").on("click", function(event){
    event.preventDefault();
    $.ajax({
        url: retainerLocation + "php/updateTask.php",
        type: "POST",
        async: false,
        data: {taskTitle: $("#hitTitle").val(), taskDescription: $("#hitDescription").val(), taskKeywords: $("#hitKeywords").val(), task: $("#taskSession").val(), country: $("#country").val(), percentApproved: $("#percentApproved").val()},
        dataType: "text",
        success: function(d) {
            alert("Update success");
        },
        fail: function() {
            alert("Sending number of workers failed");
        }
    });
});

$("#reloadHits").on("click", function(event){
    event.preventDefault();
    $('#hitsList').block({ 
        message: '<h1>Loading</h1>', 
        css: { border: '3px solid #a00' } 
    }); 

    var hits;
    $.ajax({
        url: "Retainer/php/getHits.php",
        type: "POST",
        async: true,
        data: {task: $("#taskSession").val(), useSandbox: sandbox, accessKey: $("#accessKey").val(), secretKey: $("#secretKey").val()},
        dataType: "json",
        success: function(d) {
        	$('#hitsList').unblock(); 
            hits = d;

            //Fade out all the old hits, then add the new ones.
            $('#hitsList').children().fadeOut(500).promise().then(function() {
                $('#hitsList').empty();
                var counter = 0;
                for (var request in hits) {
                    var hitInfo = hits[request];
                    var listId = "hit" + counter;
                    // alert(obj.Title);
                    if(hitInfo.hasOwnProperty("Assignment")){
                    	if(hitInfo.Assignment.hasOwnProperty("AssignmentStatus")){
                    		if(hitInfo.Assignment.AssignmentStatus == "Submitted")
                    		    $("#hitsList").append("<li id= '" + listId + "' class='list-group-item'>Worker: " + hitInfo.Assignment.WorkerId + " HITId: " + hitInfo.Assignment.HITId + " <button type='button' onclick = 'approveHit(&quot;" + hitInfo.Assignment.AssignmentId + "&quot;, &quot;" + hitInfo.Assignment.HITId + "&quot;, &quot;" + listId + "&quot;)' class='approveButton btn btn-success btn-sm'>Approve</button> <button type='button' onclick = 'rejectHit(&quot;" + hitInfo.Assignment.AssignmentId + "&quot;, &quot;" + hitInfo.Assignment.HITId + "&quot;, &quot;" + listId + "&quot;)' class='rejectButton btn btn-danger btn-sm'>Reject</button></li>");

                    		else
                    		    $("#hitsList").append("<li id= '" + listId + "' class='list-group-item'>Worker: " + hitInfo.Assignment.WorkerId + " HITId: " + hitInfo.Assignment.HITId + " <button type='button' onclick = 'disposeHit(&quot;" + hitInfo.Assignment.HITId + "&quot;, &quot;" + listId + "&quot;)' class='disposeButton btn btn-warning btn-sm'>Dispose</button></li>");
                    		counter++;
                    	}
                    }
                }
            });
        },
        fail: function() {
            alert("Sending number of workers failed");
        }
    });
});

$("#approveAll").on("click", function(event){
    event.preventDefault();
    $('#hitsList').block({ 
        message: '<h1>Working</h1>', 
        css: { border: '3px solid #a00' } 
    }); 
    $('#hitsList li').each(function() {
        var id = this.id;
        setTimeout(function(){
            $("#" + id + " .approveButton").trigger("click");
        },2500);
    });
    // alert("here");
    $('#hitsList').unblock(); 
});

$("#disposeAll").on("click", function(event){
    event.preventDefault();
    $('#hitsList').block({ 
        message: '<h1>Working</h1>', 
        css: { border: '3px solid #a00' } 
    }); 
    $('#hitsList li').each(function() {
        var id = this.id;
        setTimeout(function(){
            $("#" + id + " .disposeButton").trigger("click");
        },2500);
    });
    $('#hitsList').unblock(); 
});


$("#clearQueue").on("click", function(event){
    event.preventDefault();
    
    clearQueue(baseURL + '/Retainer/submitOnly.php');
});

function clearQueue(link){
    var numOnline = 0;
    var task = $("#taskSession").val();
    $.ajax({
        url: retainerLocation + "php/ajax_whosonline.php",
        type: "POST",
        async: false,
        data: {task: task, role: "trigger"},
        dataType: "text",
        success: function(d) {
            //
            // document.getElementById("numOnline").innerHTML= "There are " + d + " worker(s) online for this task";
            numOnline = d;
        },
        fail: function() {
            alert("setOnline failed!")
        },
    });
    var r = confirm("Send all workers in queue to destination?");
    if(r == true){
        $.ajax({
            url: retainerLocation + "php/setFire.php",
            type: "POST",
            async: false,
            data: {url: link, task: task},
            dataType: "text",
            success: function(d) {
                //
                //alert("Fire successful");
            },
            fail: function() {
                alert("Clear queue failed!");
            }
        });
        
        $.ajax({
            url: retainerLocation + "php/updateReleased.php",
            type: "POST",
            async: false,
            data: {url: link, max: numOnline, task: task},
            dataType: "text",
            success: function(d) {
                
            },
            fail: function() {
                alert("Sending number of workers failed");
            }
        });
    }
}

$("#fireWorkers").on("click", function(){
    event.preventDefault();

    var task = $("#taskSession").val();
    var link  = $("#fireToURL").val();
    var numFire  = $("#numFire").val();

    if( link.substring(0, 8) != "https://") {
        alert('ERROR: link must begin with "https://". No workers will be fired.');
        return;
    }
    else if( numFire == "" ) {
        alert('ERROR: number of workers to fire must be specified. No workers will be fired.');
        return;
    }

    var r = confirm("Fire " + numFire + " workers to: " + link + " ?");
    if(r == true){
        $.ajax({
            url: retainerLocation + "php/setFire.php",
            type: "POST",
            async: true,
            data: {url: link, task: task},
            dataType: "text",
            success: function(d) {
                $.ajax({
                    url: retainerLocation + "php/updateReleased.php",
                    type: "POST",
                    async: true,
                    data: {url: link, max: numFire, task: task},
                    dataType: "text",
                    success: function(d) {
                        
                    },
                    fail: function() {
                        alert("Sending number of workers failed");
                    }
                });
            },
            fail: function() {
                alert("Clear queue failed!");
            }
        });
    }
});

$("#yesSandbox, #noSandbox").on("click", function(){
    var id = $(this).attr('id');
    if(id == "yesSandbox"){
        $("#yesSandbox").addClass("active");
        $("#noSandbox").removeClass("active");
        sandbox = true;
    }
    else if (id == "noSandbox"){
        $("#noSandbox").addClass("active");
        $("#yesSandbox").removeClass("active");
        sandbox = false;
    }
});

$("#waitingInstructionsUpdated").on("click", function(){
    $.ajax({
        url: retainerLocation + "php/updateWaitingInstructions.php",
        type: "POST",
        data: {task: $("#taskSession").val(), instructions: $("#waitingInstructions").val()},
        dataType: "text",
        success: function(d) {
          //
        },
        fail: function() {
          alert("Sending number of workers failed");
        }
    });
});

$("#useRetainerMode").on("click", function(){
    mode = "retainer";

    $("#useDirectMode").removeClass("active");
    $("#useRetainerMode").addClass("active");

    $("#touchSpinDiv").show();
    $("#openInstructionsModal").show();
    $("#directModeForms").hide();
    $("#priceRangeDiv").show();

    $("#startStopButtons").show();
    $("#postExpireButtons").hide();

    $("#triggerDiv").show();
});

$("#useDirectMode").on("click", function(){
    mode = "direct";

    $("#useDirectMode").addClass("active");
    $("#useRetainerMode").removeClass("active");

    $("#touchSpinDiv").hide();
    $("#openInstructionsModal").hide();
    $("#directModeForms").show();
    $("#priceRangeDiv").hide();

    $("#startStopButtons").hide();
    $("#postExpireButtons").show();

    $("#triggerDiv").hide();

});

function validateTaskInfo(){
    var taskData;
    $.ajax({
        url: retainerLocation + "php/loadTask.php",
        type: "POST",
        async: false,
        data: {task: $("#taskSession").val()},
        dataType: "json",
        success: function(d) {
            taskData = d;
        },
        fail: function() {
            alert("Sending number of workers failed");
        }
    });

    // console.log(taskData);
    if(taskData.min_price == ""){
        return "min price";
    }
    if(taskData.max_price == ""){
        return "max price";
    }
    if(taskData.task_title == ""){
        return "title";
    }
    if(taskData.task_description == ""){
        return "description";
    }
    if(taskData.task_keywords == ""){
        return "keywords";
    }
    if(mode == "direct"){
        var link  = $("#sendToURL").val();
        if( link.substring(0, 8) != "https://") {
            return('URL, must begin with "https://".');
        }
    }
    return "";
}

/*
// WSL: Can't work with ajax directly because of XSS issues. To fix, use a php script that calls 'ping'.
$('#fireToURL').blur( function() {
  $('#url-alert').remove();

  $.ajax({
    type: 'HEAD',
    url: $('#fireToURL').val(),
    success: function() {
      // page exists
      $('#fireToURL').css("color", "black");
    },
    error: function() {
      // page does not exist
      //alert("Invalid URL");
      $('#fireToURL').after("<div id='url-alert' style='color: red; opacity: 0.6'><i>(Invalid URL)</i></div>");
      $('#fireToURL').css("color", "red");
    }
  });
});
*/

$("#useRetainerMode").trigger("click");



});