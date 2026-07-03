from django.db import models


class Users(models.Model):
    """Model pentru useri din tabelul MySQL existent"""
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    email = models.CharField(max_length=255, unique=True)
    password = models.CharField(max_length=60)  # BCrypt hash din Laravel
    remember_token = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
        managed = True
    
    def __str__(self):
        return self.name  # "self" = utilizatorul curent
   
    @property #@property = decorator care transformă o metoda în atribut (nu-i nevoie de ())
    def is_authenticated(self):
        """Required by Django's permission system"""
        return True
    
    @property
    def username(self):
        """Required by Django's default User requirements"""
        return self.email


class Arendatori(models.Model):
    """Model pentru arendatori - folosește tabela existentă din MySQL"""
    id_arendator = models.AutoField(primary_key=True)
    nume = models.CharField(max_length=255)
    adresa = models.CharField(max_length=255)
    cnp = models.CharField(max_length=255, null=True, blank=True)
    ci_serie = models.CharField(max_length=255)
    ci_nr = models.CharField(max_length=255)
    ci_el = models.CharField(max_length=255)
    ci_data = models.CharField(max_length=255, null=True, blank=True)
    telefon = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'arendatori'  # Folosim tabela existentă
        managed = True

    def __str__(self):
        return self.nume


class Contracte(models.Model):
    """Model pentru contracte - folosește tabela existentă din MySQL"""
    id_contract = models.AutoField(primary_key=True)
    arendator = models.ForeignKey(
        Arendatori,
        on_delete=models.CASCADE,
        db_column='id_arendator',
        related_name='contracte'
    )
    nr_contract = models.CharField(max_length=255)
    data_contract = models.DateField()
    perioada_contract = models.CharField(max_length=255)
    nivel_arenda = models.CharField(max_length=255)
    observatii = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'contracte'  # Folosim tabela existentă
        managed = True

    def __str__(self):
        return f"Contract {self.nr_contract}"
    
class Aditionale (models.Model):
    """Model pentru aditionale - folosește tabela existentă din MySQL"""
    id_aditional = models.AutoField(primary_key=True)
    contract = models.ForeignKey(
        Contracte,                    # ← Tabelul la care referi
        on_delete=models.CASCADE,     # ← Ce se întâmplă când ștergi contractul
        db_column='id_contract',      # ← Coloana din MySQL (dacă e deja creată)
        related_name='aditionale'     # ← Acces invers: contract.aditionale.all()
    )
    nr_aditional = models.CharField(max_length=255)
    data_aditional = models.DateField()
    perioada_aditional = models.CharField(max_length=255)
    nivel_arenda = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'aditionale'  # Folosim tabela existentă
        managed = True

    def __str__(self):
        return self.nr_aditional 

class Zone(models.Model):
    """Model pentru zone - folosește tabela existentă din MySQL"""
    id_zona = models.AutoField(primary_key=True)
    nume = models.CharField(max_length=255)
    created_at = models.CharField(max_length=255)
    updated_at = models.CharField(max_length=255)

    class Meta:
        db_table = 'zone'  # Folosim tabela existentă
        managed = True

    def __str__(self):
        return self.nume
    
  
class Terenuri(models.Model):
    """Model pentru vizualizarea terenuri - folosește view-ul existent din MySQL"""
    id_teren = models.AutoField(primary_key=True)
    contract = models.ForeignKey(
        Contracte,
        db_column='id_contract',
        on_delete=models.CASCADE,
        related_name='terenuri'
    )
    arendator = models.ForeignKey(
        Arendatori,
        db_column='id_arendator',
        on_delete=models.CASCADE,
        related_name='terenuri'
    )
    zona = models.ForeignKey(
        Zone,
        db_column='id_zona',
        on_delete=models.CASCADE,
        related_name='terenuri'
    )
    act_proprietate = models.CharField(max_length=255)
    nr_act_proprietate = models.CharField(max_length=255)
    data_act_proprietate = models.DateField(null=True, blank=True)
    suprafata = models.CharField(max_length=255)  # VARCHAR în MySQL
    tarla = models.CharField(max_length=255)
    parcela = models.CharField(max_length=255)
    vecin_nord = models.CharField(max_length=255, null=True, blank=True)
    vecin_est = models.CharField(max_length=255, null=True, blank=True)
    vecin_sud = models.CharField(max_length=255, null=True, blank=True)
    vecin_vest = models.CharField(max_length=255, null=True, blank=True)
    categorie_teren = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'terenuri'  # Folosim tabela existentă
        managed = True

    def __str__(self):
        return f"Teren {self.id_teren} - Tarla {self.tarla}"
    
class Arenda(models.Model):
    """Model pentru arenda anuală"""
    id_arenda = models.AutoField(primary_key=True)
    contract = models.ForeignKey(
        Contracte, 
        on_delete=models.CASCADE,
        db_column='id_contract',
        related_name='arende'
    )
    an_arenda = models.CharField(max_length=4)
    nivel_lei = models.IntegerField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ('neachitat', 'Neachitat'),
            ('achitat_partial', 'Achitat Parțial'),
            ('achitat_integral', 'Achitat Integral')
        ],
        default='neachitat'
    )
   
    
    class Meta:
        db_table = 'arenda'
        managed = True
        unique_together = ['contract', 'an_arenda']  # Un contract are o singură arendă per an
    
    def __str__(self):
        return f"Arenda {self.contract.nr_contract} - An {self.an_arenda}"
    
    def update_status(self):
        """
        Actualizează status-ul arendei pe baza plăților efectuate
        
        Logică:
        - neachitat: nicio plată cu status 'platita'
        - achitat_partial: cel puțin o plată 'platita' dar nu integral
        - achitat_integral: suma plăților >= nivel_lei * suprafață
        """
        from django.db.models import Sum
        from decimal import Decimal
        
        # Calculează suprafață totală din contract
        suprafata_totala = Terenuri.objects.filter(
            contract_id=self.contract.id_contract
        ).aggregate(Sum('suprafata'))['suprafata__sum'] or 0
        
        try:
            suprafata_totala = Decimal(str(suprafata_totala))
            nivel_lei_decimal = Decimal(str(self.nivel_lei or 0))
        except Exception:
            return  # Nu actualiza dacă nu se poate converti
        
        # Calculează nivel total datorat
        nivel_total = nivel_lei_decimal * suprafata_totala
        
        # Calculează suma platita (exclude anulate)
        total_platit = self.plati.filter(
            status='platita'
        ).aggregate(Sum('valoare_lei'))['valoare_lei__sum'] or 0
        
        total_platit = Decimal(str(total_platit))
        
        # Determină noul status
        if total_platit == 0:
            new_status = 'neachitat'
        elif total_platit >= nivel_total - Decimal('0.01'):  # Toleranță 0.01 lei
            new_status = 'achitat_integral'
        else:
            new_status = 'achitat_partial'
        
        # Actualizează dacă s-a schimbat
        if self.status != new_status:
            self.status = new_status
            self.save(update_fields=['status'])



class PlatiArenda(models.Model):
    """Model pentru plăți arendă: lei, grâu sau porumb cu tracking QR"""
    
    TIP_PLATA_CHOICES = [
        ('lei', 'Lei'),
        ('grau', 'Grâu'),
        ('porumb', 'Porumb')
    ]
    
    METODA_PLATA_CHOICES = [
        ('cash', 'Cash'),
        ('transfer', 'Transfer Bancar'),
        ('ridicare', 'Ridicare')
    ]
    
    STATUS_CHOICES = [
        ('generata', 'Generată'),
        ('platita', 'Plătită'),
        ('anulata', 'Anulată')
    ]
    
    id_plata = models.AutoField(primary_key=True)
    uuid = models.CharField(max_length=36, unique=True, editable=False)
    arenda = models.ForeignKey(
        'Arenda',
        on_delete=models.CASCADE,
        db_column='id_arenda',
        related_name='plati'
    )
    data_generarii = models.DateTimeField(auto_now_add=True)
    data_plata = models.DateTimeField(null=True, blank=True)
    
    # Tip și cantitate plată
    tip_plata = models.CharField(max_length=10, choices=TIP_PLATA_CHOICES)
    cantitate = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Preț/kg pentru conversie produse → lei
    pret_kg = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Valoare echivalentă în lei (pentru validare totală)
    valoare_lei = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Metodă plată
    metoda_plata = models.CharField(max_length=20, choices=METODA_PLATA_CHOICES, null=True, blank=True)
    
    # Status plată
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='generata')
    observatii = models.TextField(blank=True)
    
    # Tracking scanări QR
    scans = models.IntegerField(default=0)
    last_scanned = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(null=True, blank=True)

    oblio_invoice_id = models.CharField(
        max_length=255, 
        null=True, 
        blank=True,
        help_text="Oblio invoice ID for federation"
    )
    oblio_status = models.CharField(
        max_length=20,
        choices=[
            ('DRAFT', 'Draft'),
            ('SUBMITTED', 'Submitted to Oblio'),
            ('FAILED', 'Submission Failed'),
            ('SYNCED', 'Synced to SPV'),
        ],
        default='DRAFT',
        help_text="Invoice status in Oblio"
    )
    oblio_error = models.TextField(
        null=True, 
        blank=True,
        help_text="Last error from Oblio API"
    )
    oblio_submitted_at = models.DateTimeField(
        null=True,
        blank=True,
        help_text="When this was last submitted to Oblio"
    )
    
    # Idempotency & Audit
    invoice_idempotency_key = models.CharField(
        max_length=255,
        null=True,
        blank=True,
        help_text="UUID for API idempotency (prevents duplicates)"
    )
    invoice_audit_trail = models.JSONField(
        default=dict,
        help_text="Audit log: [{'timestamp': '...', 'action': '...', 'status': '...'}]"
    )
    
    class Meta:
        db_table = 'plati_arenda'
        managed = True
        ordering = ['-data_generarii']
    
    def save(self, *args, **kwargs):
        """Auto-update timestamps la fiecare save"""
        from django.utils import timezone
        
        if not self.created_at:
            self.created_at = timezone.now()
        
        self.updated_at = timezone.now()
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Plată {self.id_plata} - {self.tip_plata} {self.cantitate} ({self.status})"


class ConfigAn(models.Model):
    """Configurare prețuri kg/primărie pe an pentru grâu și porumb"""
    id = models.AutoField(primary_key=True)
    an = models.CharField(max_length=4, unique=True)
    pret_kg_grau = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Preț kg grâu la primărie pentru anul respectiv"
    )
    pret_kg_porumb = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Preț kg porumb la primărie pentru anul respectiv"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'config_an'
        ordering = ['-an']

    def __str__(self):
        return f"Config {self.an}"
