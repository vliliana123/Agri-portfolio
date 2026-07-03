from uuid import uuid4
from rest_framework import serializers
from .models import Aditionale, Arendatori, ConfigAn, Contracte, Terenuri, Zone,Arenda, PlatiArenda, Users
import bcrypt
from rest_framework_simplejwt.tokens import RefreshToken
from datetime import date
from decimal import Decimal

class LoginSerializer(serializers.Serializer):
    """Serializer pentru login cu email + password"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        """Validare credentials și returnare user + tokens"""
        email = attrs.get('email')
        password = attrs.get('password')
        
        if not email or not password:
            raise serializers.ValidationError("Email și parolă sunt obligatori")
        
        try:
            user = Users.objects.get(email=email)
        except Users.DoesNotExist:
            raise serializers.ValidationError("Email nu este înregistrat")
        except Exception as e:
            raise serializers.ValidationError(f"Eroare: {str(e)}")
        
        # Verifica password (BCrypt din Laravel - folosim bcrypt.checkpw direct)
        try:
            password_bytes = password.encode('utf-8')
            hash_bytes = user.password.encode('utf-8')
            is_valid = bcrypt.checkpw(password_bytes, hash_bytes)
            
            if not is_valid:
                raise serializers.ValidationError("Parolă incorectă")
        except Exception as e:
            raise serializers.ValidationError(f"Eroare validare: {str(e)}")
        
        # Genereaza JWT tokens
        refresh = RefreshToken()
        refresh['user_id'] = user.id
        
        attrs['user'] = user
        attrs['refresh'] = str(refresh)
        attrs['access'] = str(refresh.access_token)
        
        return attrs


class UserSerializer(serializers.ModelSerializer):
    """Serializer pentru Users"""
    class Meta:
        model = Users
        fields = ['id', 'name', 'email', 'created_at']
        read_only_fields = ['id', 'created_at']



    
class TerenuriSerializer(serializers.ModelSerializer):
    """Pentru CRUD complet - toate câmpurile"""
    nume_arendator = serializers.CharField(source='arendator.nume', read_only=True)
    id_contract = serializers.IntegerField(source='contract.id_contract', read_only=True)
    nr_contract = serializers.CharField(source='contract.nr_contract', read_only=True)
    data_contract = serializers.CharField(source='contract.data_contract', read_only=True)
    zona_nume = serializers.CharField(source='zona.nume', read_only=True)
    data_act_proprietate = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    # FK-uri write-only (frontend trimite ID-uri la POST/PUT)
    contract = serializers.PrimaryKeyRelatedField(queryset=Contracte.objects.all(), write_only=True)
    arendator = serializers.PrimaryKeyRelatedField(queryset=Arendatori.objects.all(), write_only=True)
    zona = serializers.PrimaryKeyRelatedField(queryset=Zone.objects.all(), write_only=True, required=False, allow_null=True)

    class Meta:
        model = Terenuri
        fields = [
            'id_teren',
            'contract',           # write-only
            'arendator',          # write-only
            'zona',               # write-only
            # Câmpuri din model
            'act_proprietate',
            'nr_act_proprietate',
            'data_act_proprietate',
            'suprafata',
            'tarla',
            'parcela',
            'vecin_nord',
            'vecin_est',
            'vecin_sud',
            'vecin_vest',
            'categorie_teren',
            'created_at',
            'updated_at',
            # Câmpuri extra (read-only, source=...)
            'nume_arendator',     # din arendator.nume
            'id_contract',        # din contract.id_contract
            'nr_contract',        # din contract.nr_contract
            'data_contract',      # din contract.data_contract
            'zona_nume',          # din zona.nume
        ]
        read_only_fields = ['id_teren', 'created_at', 'updated_at']

class ContracteSerializer (serializers.ModelSerializer):
    id_arendator = serializers.PrimaryKeyRelatedField(source='arendator', queryset=Arendatori.objects.all(), write_only=True)
    
    # created_at = serializers.DateTimeField(read_only=True, required=False, allow_null=True)
    # updated_at = serializers.DateTimeField(read_only=True, required=False, allow_null=True)
    terenuri = TerenuriSerializer(many=True, read_only=True)
    class Meta:
        model = Contracte
        fields = [
            'id_contract',
            'id_arendator',  # FK
            'nr_contract',
            'data_contract',
            'perioada_contract',
            'nivel_arenda',
            'observatii',
            'created_at',
            'updated_at',
            'terenuri',  # ← Nested (definit pe linia 82)
        ]
        read_only_fields = ['id_contract', 'created_at', 'updated_at']
     #   fields = '__all__'
    def validate_nr_contract(self, value):
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("Nr contract obligatoriu")
        return value

    def validate_data_contract(self, value):
        if not value:
            raise serializers.ValidationError("Data contract obligatorie")
        if value > date.today():
            raise serializers.ValidationError("Data contract nu poate fi în viitor")
        return value

    def validate_perioada_contract(self, value):
        value = (value or "").strip()
        if not value or len(value) > 100:
            raise serializers.ValidationError("Perioada contract obligatorie, max 100 caractere")
        return value

    def validate_nivel_arenda(self, value):
        try:
            nivel = Decimal(str(value))
        except Exception:
            raise serializers.ValidationError("Nivel arenda invalid (trebuie cifre)")
        if nivel <= 0:
            raise serializers.ValidationError("Nivel arenda trebuie > 0")
        return value
    
    def validate(self, attrs):
        nr_contract = attrs.get('nr_contract')
        data_contract = attrs.get('data_contract')

        # La update partial, completează din instanța curentă
        if self.instance:
            nr_contract = nr_contract if nr_contract is not None else self.instance.nr_contract
            data_contract = data_contract if data_contract is not None else self.instance.data_contract

        if nr_contract and data_contract:
            qs = Contracte.objects.filter(
                nr_contract=nr_contract,
                data_contract=data_contract
            )
            if self.instance:
                qs = qs.exclude(id_contract=self.instance.id_contract)
            if qs.exists():
                raise serializers.ValidationError({
                    "non_field_errors": ["Există deja un contract cu acest număr și această dată."]
                })

        return attrs



class ArendatoriSerializer(serializers.ModelSerializer):
    #override telefon pentru a permite blank și null
    telefon = serializers.CharField(required=False, allow_blank=True, max_length=255)
    contracte = ContracteSerializer(many=True, read_only=True)
    
    class Meta:
        model = Arendatori
        fields = [
        'id_arendator',  # PK
        'nume',
        'adresa',
        'cnp',
        'ci_serie',
        'ci_nr',
        'ci_el',
        'ci_data',
        'telefon',
        'created_at',
        'updated_at',
        'contracte',  # ← Nested (definit ca SerializerField pe linia 145)
    ]
        read_only_fields = ['id_arendator', 'created_at', 'updated_at']
      #  fields = '__all__'
    def validate_cnp(self,value):
        if not value or not value.isdigit():
            raise serializers.ValidationError("CNP trebuie sa fie numeric si nu poate ramane gol")
        return value
    
    def validate_nume(self, value):
        if not value:
            raise serializers.ValidationError("Nume este obligatoriu")
        return value
    def validate_ci_serie(self, value):
        if not value or len(value) != 2:
            raise serializers.ValidationError("Seria CI 2 litere")
        return value
    def validate_ci_nr(self,value):
        if not value or len(value) != 6 or not value.isdigit():
            raise serializers.ValidationError("Numarul CI : 6 cifre")
        return value
    def validate(self,data):
        """Object-level validation - dupa ce toate campo-urile sunt validate"""
        #validare cnp unic
        if self.instance   is None: # doar la creare
            if Arendatori.objects.filter(cnp=data['cnp']).exists():
             raise serializers.ValidationError({"cnp": "CNP deja înregistrat"})
        #in update excludem current instance (id-ul curent  nu trebuie sa fie luat in considerare)
        else:
            if Arendatori.objects.filter(cnp=data['cnp']).exclude(id_arendator=self.instance.id_arendator).exists():
                raise serializers.ValidationError({"cnp": "CNP deja înregistrat"})
        return data
class ArendatorMinimalSerializer(serializers.ModelSerializer):
    """Serializer minimal pentru Arendatori - doar id și nume"""
    class Meta:
        model = Arendatori
        fields = ['id_arendator', 'nume']

class ContracteNestedWithArendatorSerializer(serializers.ModelSerializer):
    """Serializer pentru Contracte cu arendator nested"""
    arendator = ArendatorMinimalSerializer(read_only=True)  # pentru afișare (output) nested
    id_arendator =serializers.PrimaryKeyRelatedField(source='arendator', queryset=Arendatori.objects.all(), write_only=True)
   # nume_arendator = serializers.CharField(source='arendator.nume', read_only=True)  # ← adaugă asta
    
    class Meta:
        model = Contracte
        fields = ['id_contract', 'id_arendator', 'nr_contract', 'data_contract', 'perioada_contract', 'nivel_arenda', 'observatii', 'arendator']#, 'nume_arendator'

class AditionaleSerializer(serializers.ModelSerializer):
    """Serializer pentru Aditionale - cu contract nested + arendator"""
    contract = ContracteNestedWithArendatorSerializer(read_only=True, required=False, allow_null=True)
    id_contract = serializers.PrimaryKeyRelatedField(source='contract', queryset=Contracte.objects.all(), write_only=True
)
    class Meta:
        model = Aditionale
        fields = [
        'id_aditional',
        'contract',           # nested (linia 199)
        'id_contract',        # din contract.id_contract (linia 200)
        'nr_aditional',
        'data_aditional',
        'perioada_aditional',
        'nivel_arenda',
        'created_at',
        'updated_at',
    ]
        read_only_fields = ['id_aditional', 'created_at', 'updated_at']

    # ───── Validări per câmp ─────
    def validate_nr_aditional(self, value):
        value = (value or "").strip()
        if not value:
            raise serializers.ValidationError("Nr aditional obligatoriu")
        if len(value) > 50:
            raise serializers.ValidationError("Max 50 caractere")
        return value

    def validate_data_aditional(self, value):
        if not value:
            raise serializers.ValidationError("Data obligatorie")
        if value > date.today():
            raise serializers.ValidationError("Data nu poate fi în viitor")
        return value

    def validate_perioada_aditional(self, value):
        value = (value or "").strip()
        if not value :
            raise serializers.ValidationError("Perioada obligatorie, max 100 caractere")
        
        if not value.isdigit():
            raise serializers.ValidationError("Perioada trebuie sa fie un numar (ani)")
        try:
            ani = int(value)
            if ani <= 0 or ani > 99:
                raise serializers.ValidationError("Perioada trebuie intre 1 si 99 ani")
        except ValueError:
            raise serializers.ValidationError("Perioada invalida")
        return value

    def validate_nivel_arenda(self, value):
        try:
            nivel = Decimal(str(value))
        except Exception:
            raise serializers.ValidationError("Nivel arenda invalid (trebuie cifre)")
        if nivel <= 0:
            raise serializers.ValidationError("Nivel arenda trebuie > 0")
        return value

    # ───── Validare object-level (cross-field) ─────
    def validate(self, attrs):
        # Aditionalul nu poate fi înainte de data contractului
        contract = attrs.get('contract') or (self.instance.contract if self.instance else None)
        data_aditional = attrs.get('data_aditional') or (self.instance.data_aditional if self.instance else None)

        if contract and data_aditional and data_aditional < contract.data_contract:
            raise serializers.ValidationError({
                "data_aditional": "Data aditional nu poate fi înainte de data contractului"
            })
        return attrs


class ZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Zone
        fields = ['id_zona', 'nume']







class ArendaSerializer(serializers.ModelSerializer):
    # created_at = serializers.DateTimeField(read_only=True)
    # updated_at = serializers.DateTimeField(read_only=True)
    class Meta:
        model = Arenda
        fields = [
            'id_arenda',
            'contract',           # FK
            'an_arenda',
            'nivel_lei',
            'status',
        ]
        read_only_fields = ['id_arenda']

class PlatiArendaSerializer(serializers.ModelSerializer): 
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    uuid =serializers.UUIDField(default=uuid4, read_only=True)
    scans = serializers.IntegerField(required=False, allow_null=True)
    last_scanned= serializers.DateTimeField(required=False, allow_null=True)
    oblio_invoice_id = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    oblio_status = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    oblio_error= serializers.CharField(required=False, allow_blank=True, allow_null=True)
    oblio_submitted_at= serializers.DateTimeField(required=False, allow_null=True)
    invoice_idempotency_key = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    invoice_audit_trail = serializers.JSONField(required=False, allow_null=True)

    # Câmpuri flat read-only din lanțul FK (pentru listare/căutare)
    nume_arendator = serializers.CharField(source='arenda.contract.arendator.nume', read_only=True)
    cnp_arendator = serializers.CharField(source='arenda.contract.arendator.cnp', read_only=True)
    nr_contract = serializers.CharField(source='arenda.contract.nr_contract', read_only=True)
    data_contract = serializers.DateField(source='arenda.contract.data_contract', read_only=True)
    an_arenda = serializers.CharField(source='arenda.an_arenda', read_only=True)

    class Meta:
        model = PlatiArenda
        fields = [
        'id_plata',
        'uuid',
        'arenda',                       # FK
        'data_generarii',
        'data_plata',
        'tip_plata',
        'cantitate',
        'pret_kg',
        'valoare_lei',
        'metoda_plata',
        'status',
        'observatii',
        'scans',
        'last_scanned',
        'created_at',
        'updated_at',
        # Oblio fields
        'oblio_invoice_id',
        'oblio_status',
        'oblio_error',
        'oblio_submitted_at',
        'invoice_idempotency_key',
        'invoice_audit_trail',
        # Câmpuri flat (read-only) — pentru afișare în tabel
        'nume_arendator',
        'cnp_arendator',
        'nr_contract',
        'data_contract',
        'an_arenda',
    ]
        read_only_fields= ['id_plata', 
                           'created_at', 
                           'updated_at', 'uuid',
                           'oblio_invoice_id', 
                           'oblio_status', 
                           'oblio_error', 
                           'oblio_submitted_at', 
                           'invoice_idempotency_key', 
                           'invoice_audit_trail']

    def validate_cantitate(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError("Cantitate trebuie > 0")
        return value

    def validate_valoare_lei(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError("Valoare lei trebuie > 0")
        return value

    def validate_pret_kg(self, value):
        if value is not None and value <= 0:
            raise serializers.ValidationError("Preț/kg trebuie > 0")
        return value

  

class ArendatoriDisplaySerializer(serializers.ModelSerializer):
    contracte = serializers.SerializerMethodField()
    
    class Meta:
        model = Arendatori
        # Include all identity/contact fields so details view has full CI info
        fields = [
            'id_arendator', 'nume', 'cnp',
            'ci_serie', 'ci_nr', 'ci_el', 'ci_data',
            'telefon', 'adresa',
            'contracte'
        ]
    
    def get_contracte(self, obj):
        """Returnează contractele arendatorului cu terenurile aferente"""
        contracts_qs = (
            obj.contracte
            .all()
            .prefetch_related('terenuri__zona')
        )
        
        return [
            {
                'id_contract': c.id_contract,
                'nr_contract': c.nr_contract,
                'data_contract': c.data_contract,
                'perioada_contract': c.perioada_contract,
                'nivel_arenda': c.nivel_arenda,
                'observatii': c.observatii,
                'terenuri': [
                    {
                        'id_teren': t.id_teren,
                        'act_proprietate': t.act_proprietate,
                        'suprafata': t.suprafata,
                        'tarla': t.tarla,
                        'parcela': t.parcela,
                        'zona_nume': t.zona.nume if t.zona else None,
                    }
                    for t in c.terenuri.all()
                ]
            }
            for c in contracts_qs
        ]

class ConfigAnSerializer(serializers.ModelSerializer):
    """Serializer pentru endpoint-ul de config (ex: an curent)"""
  
    class Meta:
        model = ConfigAn
        fields = [
            'id',
            'an',
            'pret_kg_grau',
            'pret_kg_porumb',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        
    def validate_an(self, value):
        value= (value or "").strip()
        if not value.isdigit() or int(value) < 2000 or int(value) > 2100 or len(value) != 4:
            raise serializers.ValidationError("Anul trebuie să fie între 2000 și 2100 si sa aiba 4 cifre")
        return value
    
    def validate_pret_kg_grau(self, value):
        if value <= 0:
            raise serializers.ValidationError("Prețul la kg de grâu trebuie să fie un număr pozitiv")
        return value
    
    def validate_pret_kg_porumb(self, value):
        if value <= 0:
            raise serializers.ValidationError("Prețul la kg de porumb trebuie să fie un număr pozitiv")
        return value