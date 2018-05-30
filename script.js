/**
 * MAIN QUEST
 * [ ] Determine Victory / Defeat / Null
 * [ ] Choose color
 * [X] EACH TURN: tell which player should play
 * [ ] Animation ( disc fall from the sky )
 * [ ] Cancel the last move before validating
 * 
 * STARTING
 * [X] Create container 
 * [X] Create rows and columns
 * [X] Parameter can take x, y
 * [ ] check x >= 7 && y >= 6 
 * [ ] check discColor1 isColor && discColor2 isColor
 * [X] Parameter can take colors
 * 
 * DURING GAME
 * [X] Check click is not on already played case
 * [ ] Mousenter / mouseleave: color trace
 * 
 * BONUS
 * [ ] Choose between Com OR Player
 * [ ] Computer A.I
 * [ ] Display color disk next to name of the player who should play and make the piece turn (just like tatami galaxy op)
 * [ ] sound effect on click: ( naruto yooo~ )
 * [ ] SSB voice: GAME ! ( when losing or winning )
 */
$.fn.connectFour = function(options) {
    
    if (typeof options === 'object') {
        var settings = $.extend({
            rows: 7,
            cols: 6,
            discColor1: 'red',
            discColor2: 'yellow',
            mode: 'duo' // or 'solo'
        }, options );
    } else {
        throw "Parameters are incorrect!";
    }

    /**
     * Create Menu
     * Close it on click and make it reappear when restart
     * 
     */
    $('.start-button').on('click', function() {
        /**
         * hide only if color are not the same
         * Create cols only after the button start click
         * ( Make create of grid a function )
         * Give color value to call function
         */
        let $mainMenu = $('.main-menu-center');
        /* TEST COLOR: NOT WORKING
            settings.discColor1 = $('[name=p1-color]').val();
            settings.discColor2 = $('[name=p2-color]').val();
            console.log(settings.discColor1);
            console.log(settings.discColor2);
        */

        if (settings.discColor1 !== settings.discColor2) {
            $mainMenu.hide();
            $disc.css({'background': settings.discColor1});
            sessionStorage.setItem('p1', 0);
            sessionStorage.setItem('p2', 0);
        }    
    });
    

    /**
     * Create Grid ( rows and cols )
     */
    $( 'script' ).before( '<div class="grid"></div>' );
    let $grid = $( '.grid' );

    for (let i = settings.rows; i > 0 ; i--) {
        $grid.append(`<div class="row" data-row="${i}"></div>`);

        let $lastRowCreated = $(`div[data-row=${i}]`);
        
        for (let j = 1; j <= settings.cols; j++) {
            $lastRowCreated.append(`<div class="col empty" data-row="${i}" data-col="${j}"></div>`);
        }
    }
    
    /**
     * Vertical check for last empty cell
     */
    function lastEmptyCol(rows, col) {
        let $cells = $(`[data-col=${col}]`);
        let $lastEmptyCol;

        $.each($cells, function(index, cell) {
            if (!cell.classList.contains('empty') || cell.dataset.row - 1 === '1') {
                return false;
            }
            $lastEmptyCol = cell;
        });
        return $lastEmptyCol;
    }

    /**
     * Game Menu
     * Create bar, title, current disc color... 
     */
    $( '.grid' ).before("<div class=\"bar\"></div>");
    let $bar = $('.bar');
    $bar.append("<h1 class=\"who-play font-effect-fire-animation\">This is your turn </h1>");
    $bar.append("<div class=\"disc\"></div>");
    $bar.after("<div class=\"game-menu\"></div>");
    let $gameMenu = $('.game-menu');
    $('.game-menu').append("<h2 class=\"winner font-effect-fire-animation\"></h2>");
    $gameMenu.append("<p class=\"p1-score\"></p>");
    $gameMenu.append("<p class=\"p2-score\"></p>");
    $gameMenu.append("<p class=\"null-score\"></p>");
    $gameMenu.append("<button class=\"again\"><i class=\"fas fa-gamepad\"></i></button>");    
    $gameMenu.append("<button class=\"home\"><i class=\"fas fa-home\"></i></button>");    
    
    let $p1Score = $('.p1-score');
    let $p2Score = $('.p2-score');
    let $nullCount = $('.null-score');
    var $disc = $('.disc');

    
    /**
     * after each clicked check whether the player has won or not
     */
    function checkGame(params) {
        
        /**
         * Check top left - bottom right 
         * Check top right - bottom left
         * @param bool alt is you want the top right - bottom left check 
         */
        function diagonalDirection(params, alt = false) {
            let playerColor = params.playerColor;
            let discsCount = 1;
            let discColIndex = ( alt ) ? params.discCol : params.discCol - 2;
            let thisDisc = params.thisDisc;

            if (thisDisc.parentElement.previousElementSibling !== null) {
                var currentDisc = thisDisc.parentElement.previousElementSibling.children[discColIndex];
            } else {
                var currentDisc = undefined;
            }
            
            while (currentDisc !== undefined && currentDisc.getAttribute('style') === `background: ${playerColor};`) {

                discsCount++;
                alt ? discColIndex++ : discColIndex--;
                
                if ( currentDisc.parentElement.previousElementSibling ) {
                    currentDisc = currentDisc.parentElement.previousElementSibling.children[discColIndex];
                } else {
                   break;
                }
            }

            // reset index
            discColIndex = ( alt ) ? params.discCol - 2 : params.discCol;
            
            if ( thisDisc.parentElement.nextElementSibling ) {
                currentDisc = thisDisc.parentElement.nextElementSibling.children[discColIndex];
            } else {
                currentDisc = undefined;
            }

            while (currentDisc !== undefined && currentDisc.getAttribute('style') === `background: ${playerColor};`) {
                discsCount++;
                alt ? discColIndex-- : discColIndex++;

                if ( currentDisc.parentElement.nextElementSibling ) {
                    currentDisc = currentDisc.parentElement.nextElementSibling.children[discColIndex];
                } else {
                    break;
                }
            }
            return discsCount;
        }

        /**
         * Main function for diagonal checking
         */
        function checkDiagonal(params) {

            if ( diagonalDirection(params) >= 4 || diagonalDirection(params, true) >= 4 ) {
                return true;
            } else {
                return false;
            }
        }
        
        function checkCol(params) {
            let playerColor = params.playerColor;
            let discsCount = 1;
            let col = params.discCol - 1;
            let currentDisc = params.thisDisc;
            let thisDisc = currentDisc.parentElement.previousElementSibling;
            
            while (thisDisc !== null && thisDisc.children[col].getAttribute('style') === `background: ${playerColor};`) {
                discsCount++;

                if (thisDisc.previousElementSibling !== null) {
                    thisDisc = thisDisc.previousElementSibling;
                } else {
                    break;
                }
            }

            thisDisc = currentDisc.parentElement.nextElementSibling;
            while (thisDisc !== null && thisDisc.children[col].getAttribute('style') === `background: ${playerColor};`) {
                discsCount++;
                
                if (thisDisc.nextElementSibling !== null) {
                    thisDisc = thisDisc.nextElementSibling;
                } else {
                    break;
                }
            }
            return ( discsCount >= 4 ) ? true : false;
        }

        function checkRow(params) {
            let discsCount = 1;
            let playerColor = params.playerColor;
            let thisDisc = params.thisDisc;
            let currentDisc = params.thisDisc.previousElementSibling;
            
            while (currentDisc !== null && currentDisc.getAttribute('style') === `background: ${playerColor};`) {
                discsCount++;
                
                if ( currentDisc.previousElementSibling !== null) {
                    currentDisc = currentDisc.previousElementSibling;
                } else {
                    break;
                }
            }
            
            currentDisc = params.thisDisc.nextElementSibling;
            
            while (currentDisc !== null && currentDisc.getAttribute('style') === `background: ${playerColor};`) {
                discsCount++;
                
                if (currentDisc.nextElementSibling !== null) {
                    currentDisc = currentDisc.nextElementSibling;
                } else {
                    break;
                }
            }

            return ( discsCount >= 4 ) ? true : false;
        }

        if (checkRow(params) || checkCol(params) || checkDiagonal(params)) {
            return true;
        }
        
        return false;
    }

    /**
     *  DURING GAME
     *  EACH TURN ( on click ): 
     * [X] Change player
     * [X] Check column
     * [X] Check game status ( vicotry / defeat / null )
     * [X] Count disk to detect null ? ( and tell which turn it is )
     * [X] Change title to Puissance 4 when in main menu
     */
    let player1WinCount = 0;
    let player2WinCount = 0;
    let gameNullCount = 0;
    var playerColor = settings.discColor1;
    var counter = 0;
    const totalCells = settings.rows * settings.cols;
    var lastMove = null;
        
    $( $grid ).on('click', '.col.empty', function() {

        counter++;
        const col = $( this ).data("col");
        let $emptyCol = lastEmptyCol(settings.rows, col);
        const row = $( $emptyCol ).data('row');
        lastMove = $emptyCol;
        
        $emptyCol.classList.remove('empty');
        $emptyCol.style.background = playerColor;
        
        let gameStatus = checkGame(
            {
                playerColor: playerColor,
                thisDisc: $emptyCol,
                discRow: row,
                discCol: col,
                rows: settings.rows,
                cols: settings.cols
            }
        );

        if (gameStatus) {
            let winner = (playerColor === settings.discColor1 ? 1 : 2);
            $('.winner').html(`Player ${winner} won the game !`);
            playerColor === settings.discColor1 ? player1WinCount++ : player2WinCount++;
            /**
             * Update scoreboard
             * Create discs item for p1, p2, nullCount
             */
            sessionStorage.setItem('p1', player1WinCount);
            sessionStorage.setItem('p2', player2WinCount);
            sessionStorage.setItem('null', gameNullCount);
            
            $p1Score.html(sessionStorage.getItem('p1'));
            $p2Score.html(sessionStorage.getItem('p2'));
            $nullCount.html(sessionStorage.getItem('null'));

            $p1Score.html(`<span class=\"disc p1\"></span>`);
            $('.disc.p1').css({background: settings.discColor1});
            $('.disc.p1').html(sessionStorage.getItem('p1'));        
            $p2Score.html('<span class=\"disc p2\"></span>');        
            $('.disc.p2').css({background: settings.discColor2});       
            $('.disc.p2').html(sessionStorage.getItem('p2'));        
            $nullCount.html('<span class=\"disc null\"></span>');        
            $('.disc.null').html(sessionStorage.getItem('null'));

            $gameMenu.show();
            console.log(sessionStorage.getItem('p1'));
            console.log(sessionStorage.getItem('p2'));
        }

        if ( counter >= totalCells ) {
            gameNullCount++;
            $('.winner').html(`No winner !`);

            sessionStorage.setItem('p1', player1WinCount);
            sessionStorage.setItem('p2', player2WinCount);
            sessionStorage.setItem('null', gameNullCount);
            
            $p1Score.html(sessionStorage.getItem('p1'));
            $p2Score.html(sessionStorage.getItem('p2'));
            $nullCount.html(sessionStorage.getItem('null'));

            $p1Score.html(`<span class=\"disc p1\"></span>`);
            $('.disc.p1').css({background: settings.discColor1});
            $('.disc.p1').html(sessionStorage.getItem('p1'));        
            $p2Score.html('<span class=\"disc p2\"></span>');        
            $('.disc.p2').css({background: settings.discColor2});       
            $('.disc.p2').html(sessionStorage.getItem('p2'));        
            $nullCount.html('<span class=\"disc null\"></span>');        
            $('.disc.null').html(sessionStorage.getItem('null'));
            
            $gameMenu.show();
        }

        playerColor = ( playerColor === settings.discColor1 ) ? settings.discColor2 : settings.discColor1;
        $disc.css({'background': playerColor});
    });

    /**
     * Remove last move
     */
    // $('.disc').on('click', function() {
    //     if (lastMove !== null && counter > 0) {
    //         playerColor = $( lastMove ).css('background');
    //         console.log(playerColor);
            
    //         counter--;
    //     }

    // });

    /**
     * Game Menu interactivity
     * return to home menu and reset grid
     */
    $('.home').on('click', function() {
        let $mainMenu = $('.main-menu-center');
        player1WinCount = 0;
        player2WinCount = 0;
        counter = 0;

        $.each($('.col'), function(key, value) {
            $( value ).removeAttr('style').addClass("empty");
        });

        $gameMenu.hide();
        $mainMenu.show();
    });
    
    /**
     * Game Menu: Play again button 
     */
    $('.again').on('click', function() {
        playerColor = ( playerColor === settings.discColor1 ) ? settings.discColor1 : settings.discColor2;
        $disc.css({'background': playerColor});
        counter = 0;

        $.each($('.col'), function(key, value) {
            $( value ).removeAttr('style').addClass("empty");
        });

        $gameMenu.hide();
    });

    
};

$('body').connectFour( {rows: 6, cols: 7, discColor1: 'red', discColor2: 'yellow'} );

// $('.grid').on('click', '.col', function() {
//     // $(this)[0].parentNode.dataset.row
//     console.log( $(this)[0].dataset.row, $(this)[0].dataset.col );

// });