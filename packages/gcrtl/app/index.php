<?php

preg_match("|^/(https?)/(localhost(:\d+)?)/(.*)$|", $_SERVER['REQUEST_URI'], $matches);
list(, $protocol, $host,, $path) = $matches;

if (!empty($protocol) && !empty($host)):
    header("Location: $protocol://$host/$path");
    exit(0);
else:
    http_response_code(400); ?>
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Localhost Redirect</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB" crossorigin="anonymous">
        <style>
            .wrapper {
                display: grid;
                grid-template-columns: 1fr auto 1fr;
                grid-template-rows: 1fr auto 1.61803fr;
                position: absolute;
                width: 100vw;
                height: 100vh;
                top: 0;
                left: 0;
            }

            .center {
                grid-row: 2;
                grid-column: 2;
            }
        </style>

    </head>

    <body>
        <div class="wrapper">
            <div class="container center">
                <h1>Error 400: Bad Request</h1>
                <p>Request path must follow the pattern <code>^/https?/localhost(:\d+)?/.*$</code></p>
                <pre>
REQUEST_URI=<?= $_SERVER['REQUEST_URI'] ?>
    </pre>
            </div>
        </div>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js" integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI" crossorigin="anonymous"></script>
    </body>

    </html>
<?php
endif;
