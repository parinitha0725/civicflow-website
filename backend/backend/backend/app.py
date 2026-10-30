from flask import Flask, render_template

app = Flask(
    __name__,
    template_folder="../templates",
    static_folder="../static"
)

app.config["SECRET_KEY"] = "change-this-to-a-random-secret"

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/login")
def login():
    return render_template("login.html")

@app.route("/register")
def register():
    return render_template("register.html")

@app.route("/citizen-dashboard")
def citizen_dashboard():
    return render_template("citizen_dashboard.html")

@app.route("/admin-dashboard")
def admin_dashboard():
    return render_template("admin_dashboard.html")

@app.route("/report")
def report():
    return render_template("report.html")

@app.route("/track")
def track():
    return render_template("track.html")

@app.route("/profile")
def profile():
    return render_template("profile.html")

if __name__ == "__main__":
    app.run(
    host="127.0.0.1",
    port=5000,
    debug=True,
    use_reloader=False
)