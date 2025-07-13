from app import create_app, db
from flask.cli import with_appcontext
import click

# Create app instance
app = create_app()

# CLI command: initialize the database
@click.command(name="create-db")
@with_appcontext
def create_db():
    """Create all database tables."""
    db.create_all()
    click.echo("✅ Database tables created.")

# CLI command: drop all tables (use with caution!)
@click.command(name="drop-db")
@with_appcontext
def drop_db():
    """Drop all database tables."""
    db.drop_all()
    click.echo("⚠️ Database tables dropped.")

# CLI command: seed the database with default data
@click.command(name="seed-data")
@with_appcontext
def seed_data():
    """Seed the database with default users, clinics, and slots."""
    from database.seed_data import run_seed
    run_seed()
    click.echo("🌱 Database seeded with sample data.")

# Register custom CLI commands
app.cli.add_command(create_db)
app.cli.add_command(drop_db)
app.cli.add_command(seed_data)

# Main entry point (optional for direct script use)
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
