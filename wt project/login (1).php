<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
        }

        header {
            background-color: #333;
            color: #fff;
            padding: 20px;
        }

        nav ul {
            list-style-type: none;
            padding: 0;
        }

        nav ul li {
            display: inline;
            margin-right: 20px;
        }

        nav ul li a {
            color: #fff;
            text-decoration: none;
        }

        main {
            padding: 20px;
        }

        footer {
            background-color: #333;
            color: #fff;
            text-align: center;
            padding: 20px;
            position: fixed;
            bottom: 0;
            width: 100%;
        }

        /* Style for the login form */
        #login-form {
            margin: 20px auto;
            padding: 20px;
            max-width: 300px;
            border: 1px solid #ccc;
            border-radius: 8px;
            background-color: #f9f9f9;
        }

        #login-form input[type="text"],
        #login-form input[type="password"],
        #login-form input[type="submit"] {
            width: 100%;
            padding: 10px;
            margin-bottom: 10px;
            border-radius: 5px;
            border: 1px solid #ccc;
            box-sizing: border-box;
        }

        #login-form input[type="submit"] {
            background-color: #333;
            color: #fff;
            cursor: pointer;
        }

        #login-form input[type="submit"]:hover {
            background-color: #555;
        }
    </style>
</head>
<body>
    <header>
        <h1>Welcome to Admin Panel</h1>
        <nav>
            <ul>
                <li><a href="#">Users</a></li>
                <li><a href="#">Logout</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <section id="login-form">
            <h2>Login</h2>
            <form action="login.php" method="post">
                <label for="username">Username:</label>
                <input type="text" id="username" name="username" required><br>
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required><br>
                <input type="submit" value="Login">
            </form>
        </section>
    </main>

    <footer>
        <p>&copy; 2024 Admin Panel</p>
    </footer>
</body>
</html>
