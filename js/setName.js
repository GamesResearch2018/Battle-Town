var name
var numberXX = (Math.random() * 10)


$(document).ready(function() {
    $("#play").click(function(e) {
        e.preventDefault()
		
		name =  $("#username").val()
		if(name == ""){;
			name = ("Solider" + (numberXX.toFixed(2)*100));
		}
		console.log(name)
		
        
        window.localPlayer.displayName = name;
        window.localPlayer.label.setText(name);
        $(".gameDiv").fadeOut(300)
        eurecaServer.assignName(window.localPlayer.playerSprite.id, name);
    });
})