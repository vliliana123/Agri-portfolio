"""
Populates the database with realistic Romanian synthetic data.
Usage:  python manage.py seed_demo

Idempotent: wipes existing data before seeding (skips Users if any exist).
"""

import random
import uuid as uuid_lib
from datetime import date, timedelta
from decimal import Decimal

import bcrypt
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from faker import Faker

from api.models import (
    Aditionale, Arenda, Arendatori, ConfigAn, Contracte,
    PlatiArenda, Terenuri, Users, Zone,
)


# =============================================================================
# Helpers
# =============================================================================

fake = Faker("ro_RO")

DEMO_USER_EMAIL = "demo@agri.local"
DEMO_USER_PASSWORD = "demo1234"

ZONE_NAMES = [
    "Belcești", "Cotnari", "Focuri", "Hlincea", "Iași",
    "Podu Iloaiei", "Prisăcani", "Ruginoasa", "Târgu Frumos", "Voinești",
]

CATEGORII_TEREN = ["arabil", "pășune", "vie", "livada", "fâneață"]
ACTE_PROPRIETATE = ["Titlu proprietate", "Contract vânzare", "Certificat moștenitor"]
METODE_PLATA = ["cash", "transfer", "ridicare"]
TIP_PLATA_WEIGHTS = [("porumb", 5), ("grau", 4), ("lei", 1)]
STATUS_PLATA_WEIGHTS = [("platita", 6), ("generata", 3), ("anulata", 1)]


def weighted_choice(pairs):
    """Pick one item from [(value, weight), ...]"""
    values, weights = zip(*pairs)
    return random.choices(values, weights=weights, k=1)[0]


def make_cnp(is_female=None, birth_year=None):
    """
    Generate a valid Romanian CNP (Cod Numeric Personal) — synthetic.
    Uses the standard Luhn-like control-digit algorithm.
    """
    if is_female is None:
        is_female = random.choice([True, False])
    if birth_year is None:
        birth_year = random.randint(1950, 2000)

    # Sex-century digit: 1/2 for 1900s, 5/6 for 2000s
    if birth_year < 2000:
        s = 2 if is_female else 1
    else:
        s = 6 if is_female else 5

    yy = birth_year % 100
    mm = random.randint(1, 12)
    dd = random.randint(1, 28)
    jj = random.randint(1, 46)  # county code
    nnn = random.randint(1, 999)

    body = f"{s}{yy:02d}{mm:02d}{dd:02d}{jj:02d}{nnn:03d}"
    weights = [2, 7, 9, 1, 4, 6, 3, 5, 8, 2, 7, 9]
    total = sum(int(body[i]) * weights[i] for i in range(12))
    ctrl = total % 11
    if ctrl == 10:
        ctrl = 1
    return body + str(ctrl)


def bcrypt_hash(plain: str) -> str:
    """Hash password with bcrypt (Laravel-compatible)."""
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def random_date_between(start: date, end: date) -> date:
    delta = (end - start).days
    return start + timedelta(days=random.randint(0, max(delta, 0)))


# =============================================================================
# Command
# =============================================================================


class Command(BaseCommand):
    help = "Populate the database with synthetic Romanian demo data."

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("🌱 Seeding demo data..."))

        with transaction.atomic():
            self._wipe()
            user = self._seed_user()
            zones = self._seed_zones()
            arendatori = self._seed_arendatori(count=15)
            contracte = self._seed_contracte(arendatori, count=20)
            self._seed_terenuri(contracte, zones, count=30)
            self._seed_aditionale(contracte, count=8)
            arende = self._seed_arende(contracte, count=15)
            self._seed_plati(arende, count=25)
            self._seed_config_an()

        self.stdout.write(self.style.SUCCESS("✅ Done."))
        self.stdout.write(self.style.SUCCESS(
            f"👤 Demo login → {DEMO_USER_EMAIL} / {DEMO_USER_PASSWORD}"
        ))

    # ---------- individual seeders ----------

    def _wipe(self):
        """Delete everything except keep count for report."""
        PlatiArenda.objects.all().delete()
        Arenda.objects.all().delete()
        Aditionale.objects.all().delete()
        Terenuri.objects.all().delete()
        Contracte.objects.all().delete()
        Arendatori.objects.all().delete()
        Zone.objects.all().delete()
        ConfigAn.objects.all().delete()
        Users.objects.all().delete()
        self.stdout.write("  cleared old data")

    def _seed_user(self):
        user = Users.objects.create(
            name="Demo User",
            email=DEMO_USER_EMAIL,
            password=bcrypt_hash(DEMO_USER_PASSWORD),
        )
        self.stdout.write(f"  1 user")
        return user

    def _seed_zones(self):
        zones = [Zone.objects.create(nume=n, created_at="", updated_at="")
                 for n in ZONE_NAMES]
        self.stdout.write(f"  {len(zones)} zones")
        return zones

    def _seed_arendatori(self, count):
        arendatori = []
        for _ in range(count):
            is_female = random.choice([True, False])
            first = fake.first_name_female() if is_female else fake.first_name_male()
            last = fake.last_name()
            nume = f"{last} {first}"

            a = Arendatori.objects.create(
                nume=nume,
                adresa=fake.address().replace("\n", ", "),
                cnp=make_cnp(is_female=is_female),
                ci_serie=random.choice(["MZ", "MX", "XR", "II", "AV"]),
                ci_nr=str(random.randint(100000, 999999)),
                ci_el=f"SPCLEP {random.choice(['Iași', 'Pașcani', 'Târgu Frumos'])}",
                ci_data=str(random_date_between(date(2010, 1, 1), date(2023, 12, 31))),
                telefon=f"07{random.randint(10, 99)}{random.randint(100000, 999999)}",
            )
            arendatori.append(a)
        self.stdout.write(f"  {len(arendatori)} arendatori")
        return arendatori

    def _seed_contracte(self, arendatori, count):
        contracte = []
        used_combos = set()
        while len(contracte) < count:
            arendator = random.choice(arendatori)
            nr = str(random.randint(1, 999))
            data_c = random_date_between(date(2014, 1, 1), date(2020, 12, 31))
            key = (nr, data_c)
            if key in used_combos:
                continue
            used_combos.add(key)

            c = Contracte.objects.create(
                arendator=arendator,
                nr_contract=nr,
                data_contract=data_c,
                perioada_contract=str(random.choice([5, 7, 10])),
                nivel_arenda=str(random.choice([700, 800, 1000, 1200])),
                observatii=fake.sentence() if random.random() < 0.3 else "",
            )
            contracte.append(c)
        self.stdout.write(f"  {len(contracte)} contracte")
        return contracte

    def _seed_terenuri(self, contracte, zones, count):
        created = 0
        # ensure each contract has at least one teren
        for c in contracte:
            self._make_teren(c, zones)
            created += 1
            if created >= count:
                break
        # extra terenuri on random contracts
        while created < count:
            c = random.choice(contracte)
            self._make_teren(c, zones)
            created += 1
        self.stdout.write(f"  {created} terenuri")

    def _make_teren(self, contract, zones):
        return Terenuri.objects.create(
            contract=contract,
            arendator=contract.arendator,
            zona=random.choice(zones),
            act_proprietate=random.choice(ACTE_PROPRIETATE),
            nr_act_proprietate=str(random.randint(100, 9999)),
            data_act_proprietate=random_date_between(date(2000, 1, 1), date(2020, 12, 31)),
            suprafata=str(round(random.uniform(0.5, 15.0), 2)),
            tarla=str(random.randint(1, 200)),
            parcela=str(random.randint(1, 500)),
            vecin_nord=fake.last_name(),
            vecin_est=fake.last_name(),
            vecin_sud=fake.last_name(),
            vecin_vest=fake.last_name(),
            categorie_teren=random.choice(CATEGORII_TEREN),
        )

    def _seed_aditionale(self, contracte, count):
        sample = random.sample(contracte, min(count, len(contracte)))
        for c in sample:
            Aditionale.objects.create(
                contract=c,
                nr_aditional=str(random.randint(1, 999)),
                data_aditional=random_date_between(date(2018, 1, 1), date(2023, 12, 31)),
                perioada_aditional=str(random.choice([3, 5, 7])),
                nivel_arenda=str(random.choice([800, 1000, 1200])),
            )
        self.stdout.write(f"  {len(sample)} aditionale")

    def _seed_arende(self, contracte, count):
        arende = []
        combos = set()
        sample = random.sample(contracte, min(count, len(contracte)))
        for c in sample:
            an = str(random.choice([2024, 2025, 2026]))
            key = (c.id_contract, an)
            if key in combos:
                continue
            combos.add(key)
            a = Arenda.objects.create(
                contract=c,
                an_arenda=an,
                nivel_lei=random.choice([700, 800, 1000, 1200]),
                status="neachitat",
            )
            arende.append(a)
        self.stdout.write(f"  {len(arende)} arende")
        return arende

    def _seed_plati(self, arende, count):
        if not arende:
            return
        plati_count = 0
        while plati_count < count:
            arenda = random.choice(arende)
            tip = weighted_choice(TIP_PLATA_WEIGHTS)
            cantitate = Decimal(str(round(random.uniform(100, 3000), 2)))

            if tip == "lei":
                pret_kg = None
                valoare = cantitate
            else:
                pret_kg = Decimal(str(round(random.uniform(0.6, 1.2), 2)))
                valoare = (cantitate * pret_kg).quantize(Decimal("0.01"))

            status = weighted_choice(STATUS_PLATA_WEIGHTS)
            data_plata = (
                timezone.now() - timedelta(days=random.randint(1, 200))
                if status == "platita" else None
            )

            PlatiArenda.objects.create(
                uuid=str(uuid_lib.uuid4()),
                arenda=arenda,
                tip_plata=tip,
                cantitate=cantitate,
                pret_kg=pret_kg,
                valoare_lei=valoare,
                metoda_plata=random.choice(METODE_PLATA) if status == "platita" else None,
                status=status,
                observatii=fake.sentence() if random.random() < 0.2 else "",
                data_plata=data_plata,
            )
            plati_count += 1

        # Refresh arenda statuses based on payments
        for a in arende:
            a.update_status()

        self.stdout.write(f"  {plati_count} plati_arenda")

    def _seed_config_an(self):
        for an in ["2024", "2025", "2026"]:
            ConfigAn.objects.create(
                an=an,
                pret_kg_grau=Decimal(str(round(random.uniform(0.7, 1.1), 2))),
                pret_kg_porumb=Decimal(str(round(random.uniform(0.6, 1.0), 2))),
            )
        self.stdout.write("  3 config_an")
