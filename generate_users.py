import json
import uuid
from faker import Faker
from datetime import datetime, timedelta
import os

# Inițializăm Faker
fake = Faker()

def generate_users(num_users=50):
    users = []
    for _ in range(num_users):
        created_date = fake.date_time_between(start_date='-2y', end_date='now')
        last_sign_in = created_date + timedelta(days=fake.random_int(min=1, max=60))
        
        user = {
            "id": str(uuid.uuid4()),
            "email": fake.unique.email(),
            "created_at": created_date.isoformat() + "Z",
            "last_sign_in_at": last_sign_in.isoformat() + "Z" if fake.boolean(chance_of_getting_true=80) else None,
        }
        users.append(user)
    return users

if __name__ == "__main__":
    os.makedirs('src/data', exist_ok=True)
    file_path = 'src/data/users.json'
    user_data = generate_users(50)
    with open(file_path, 'w') as f:
        json.dump(user_data, f, indent=2)
    print(f"✅ Datele au fost generate cu succes în {file_path}")