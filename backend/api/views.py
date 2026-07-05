 
from urllib import request
import requests
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
import requests
from django.conf import settings
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import viewsets, status
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Arenda,Aditionale, Arendatori, ConfigAn, Contracte, PlatiArenda, Terenuri, Zone, Users
from .serializers import AditionaleSerializer, ArendaSerializer, ConfigAnSerializer, PlatiArendaSerializer, ArendatoriSerializer, ArendatoriDisplaySerializer, ContracteSerializer, ZoneSerializer, TerenuriSerializer, LoginSerializer, UserSerializer, ContracteNestedWithArendatorSerializer
from uuid import uuid4
from django.db.models import Sum
from decimal import Decimal
from datetime import timedelta 

# Helper: setează cookies de auth pe un Response
def set_auth_cookies(response, access_token, refresh_token=None):
    """Setează access_token (și opțional refresh_token) ca cookies httpOnly."""
    response.set_cookie(
        key='access_token',
        value=access_token,
        httponly=True,
        secure=settings.AUTH_COOKIE_SECURE,   # True automat în producție (HTTPS)
        samesite='Lax',
        max_age=int(timedelta(hours=2).total_seconds()),
        path='/api/',                  # cookie trimis doar pe rute /api/
    )
    if refresh_token is not None:
        response.set_cookie(
            key='refresh_token',
            value=refresh_token,
            httponly=True,
            secure=settings.AUTH_COOKIE_SECURE,   # True automat în producție (HTTPS)
            samesite='Lax',
            max_age=int(timedelta(days=30).total_seconds()),
            path='/api/token/refresh/',  # cookie trimis DOAR la refresh
        )
    return response

class LoginView(APIView):
    """
    POST /api/login/
    Endpoint pentru autentificare cu email + password.
    Setează access_token și refresh_token ca cookies httpOnly.
    Returnează DOAR user info în body (NU și tokens).
    """
    permission_classes = [AllowAny] 
    throttle_scope = 'login'
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = serializer.validated_data['user']
        access = serializer.validated_data['access']
        refresh = serializer.validated_data['refresh']

        response = Response(
            {'user': UserSerializer(user).data},
            status=status.HTTP_200_OK
        )
        return set_auth_cookies(response, access, refresh)


class LogoutView(APIView):
    """
    POST /api/logout/
    Șterge cookies-urile de auth.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        response = Response(
            {'message': 'Logout successful'},
            status=status.HTTP_200_OK
        )
        # IMPORTANT: path-urile trebuie să se potrivească EXACT cu cele de la set
        response.delete_cookie('access_token', path='/api/', samesite='Lax')
        response.delete_cookie('refresh_token', path='/api/token/refresh/', samesite='Lax')
        return response

class MeView(APIView):
    """
    GET /api/me/
    Returnează user-ul curent dacă e autentificat.    """
    # Folosit de frontend la mount pentru a verifica starea de auth
    # (nu mai citim localStorage — e cookie httpOnly invizibil din JS).

    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(
            UserSerializer(request.user).data,
            status=status.HTTP_200_OK
        )


class CookieTokenRefreshView(APIView):
    """
    POST /api/token/refresh/     """
    # Citește refresh_token din cookie, emite un nou access_token și
    # îl setează tot ca cookie httpOnly.
    # Body request gol — refresh-ul vine din cookie automat.

    permission_classes = [AllowAny]

    def post(self, request):
        refresh_token_value = request.COOKIES.get('refresh_token')
        if not refresh_token_value:
            return Response(
                {'error': 'No refresh token provided'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            refresh = RefreshToken(refresh_token_value)
            new_access = str(refresh.access_token)
        except (InvalidToken, TokenError) as exc:
            return Response(
                {'error': f'Invalid refresh token: {str(exc)}'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        response = Response({'success': True}, status=status.HTTP_200_OK)
        return set_auth_cookies(response, new_access, refresh_token=None)

class ArendatoriViewSet(viewsets.ModelViewSet):
    permission_classes = [ IsAuthenticated]
    # """
    # Django REST Framework oferă paginare automată prin ModelViewSet
    # Parametrii limit și offset din URL sunt procesați automat
    # Da, exact! search_fields este o proprietate predefinită din SearchFilter de la Django REST Framework.
    # API endpoint CRUD pentru arendatori.
    # GET /api/arendatori/ - listă
    # GET /api/arendatori/{id}/ - detalii
    # """
    queryset = Arendatori.objects.all().prefetch_related(
        'contracte__terenuri'
    )
    serializer_class = ArendatoriSerializer

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['nume', 'cnp', 'telefon']  # filtrare exactă
    search_fields = ['nume', 'cnp', 'telefon']      # căutare parțială
    ordering_fields = ['nume', 'id_arendator']      # sortare

    @action(detail=True, methods=['get'], url_path='details')
    def get_details(self, request, pk=None):
        """
        Endpoint special pentru modal cu toate detaliile
        GET /api/arendatori/{id}/details/ - detalii complete cu contracte
        """
        arendator = self.get_object()  # ← Self-magic: Django știe pk din URL și aduce arendatorul
        serializer = ArendatoriDisplaySerializer(arendator)
        return Response(serializer.data)

   


class ContracteViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
   # permission_classes = [AllowAny] 
    """
    API endpoint read-only pentru contracte.
    GET /api/contracte/ - listă  
    GET /api/contracte/list/ - listă completă  
    GET /api/contracte/{id}/ - detalii
    """
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['nr_contract'] # Funcționează doar dacă endpoint-ul standard ar merge (dar acum dă eroare)
    search_fields = ['nr_contract', 'observatii','arendator__nume', 'arendator__cnp']  # căutare parțială în nr_contract, nume arendator, cnp arendator
    #Cu arendator__nume (double underscore), DRF/Django traversează FK-ul și caută în câmpurile arendatorului.
    ordering_fields = ['id_contract', 'data_contract', 'nr_contract']
    
    queryset = Contracte.objects.select_related('arendator').all()
    
    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return ContracteSerializer           # ← cu validatori, id_arendator write
        return ContracteNestedWithArendatorSerializer  # ← list, retrieve, details
 
  
    
    @action(detail=True, methods=['get'], url_path='details')
    def get_details(self, request, pk=None):
        """
             GET /api/contracte/{id}/details/
             Detalii complete contract: arendator + terenuri cu zone
             Optimizat pentru performanță: folosim select_related și prefetch_related"""
        # from django.db import connection
        # cursor = connection.cursor()

        # cursor.execute("""
        #     SELECT c.id_contract, c.nr_contract, c.data_contract,
        #         c.perioada_contract, c.nivel_arenda, c.observatii,
        #         c.id_arendator, a.nume, a.cnp, a.telefon, a.adresa
        #     FROM contracte c
        #     LEFT JOIN arendatori a ON a.id_arendator = c.id_arendator
        #     WHERE c.id_contract = %s
        # """, [pk])
        # row = cursor.fetchone()
        # if not row:
        #     return Response({'error': 'Contract nu există'}, status=404)

        # contract_data = {
        #     'id_contract': row[0],
        #     'nr_contract': row[1],
        #     'data_contract': row[2],
        #     'perioada_contract': row[3],
        #     'nivel_arenda': row[4],
        #     'observatii': row[5],
        #     'arendator': {
        #         'id_arendator': row[6],
        #         'nume': row[7],
        #         'cnp': row[8],
        #         'telefon': row[9],
        #         'adresa': row[10],
        #     }
        # }

        # cursor.execute("""
        #     SELECT t.id_teren, t.act_proprietate, t.nr_act_proprietate,
        #         t.data_act_proprietate, t.suprafata, t.tarla, t.parcela,
        #         t.vecin_nord, t.vecin_est, t.vecin_sud, t.vecin_vest,
        #         t.categorie_teren, t.id_zona, z.nume as zona_nume
        #     FROM terenuri t
        #     LEFT JOIN zone z ON t.id_zona = z.id_zona
        #     WHERE t.id_contract = %s
        # """, [pk])

        # terenuri = []
        # for t in cursor.fetchall():
        #     terenuri.append({
        #         'id_teren': t[0],
        #         'act_proprietate': t[1],
        #         'nr_act_proprietate': t[2],
        #         'data_act_proprietate': t[3],
        #         'suprafata': t[4],
        #         'tarla': t[5],
        #         'parcela': t[6],
        #         'vecin_nord': t[7],
        #         'vecin_est': t[8],
        #         'vecin_sud': t[9],
        #         'vecin_vest': t[10],
        #         'categorie_teren': t[11],
        #         'id_zona': t[12],
        #         'zona_nume': t[13],
        #     })

        # contract_data['terenuri'] = terenuri
        # return Response(contract_data)
        try:
            contract = Contracte.objects.select_related('arendator').prefetch_related('terenuri__zona').get(id_contract=pk)
        except Contracte.DoesNotExist:
            return Response({'error': 'Contract nu există'}, status=404)
    
        contract_data = {
        'id_contract': contract.id_contract,
        'nr_contract': contract.nr_contract,
        'data_contract': contract.data_contract,
        'perioada_contract': contract.perioada_contract,
        'nivel_arenda': contract.nivel_arenda,
        'observatii': contract.observatii,
        'arendator': {
            'id_arendator': contract.arendator.id_arendator,
            'nume': contract.arendator.nume,
            'cnp': contract.arendator.cnp,
            'telefon': contract.arendator.telefon,
            'adresa': contract.arendator.adresa,
        },
        'terenuri': [
            {
                'id_teren': t.id_teren,
                'act_proprietate': t.act_proprietate,
                'nr_act_proprietate': t.nr_act_proprietate,
                'data_act_proprietate': t.data_act_proprietate,
                'suprafata': t.suprafata,
                'tarla': t.tarla,
                'parcela': t.parcela,
                'vecin_nord': t.vecin_nord,
                'vecin_est': t.vecin_est,
                'vecin_sud': t.vecin_sud,
                'vecin_vest': t.vecin_vest,
                'categorie_teren': t.categorie_teren,
                'id_zona': t.zona.id_zona if t.zona else None,
                'zona_nume': t.zona.nume if t.zona else None,
            }
            for t in contract.terenuri.all()
        ]
        }
    
        return Response(contract_data)

    
    
class AditionaleViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Aditionale.objects.all()
    serializer_class = AditionaleSerializer

  

    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['contract' ]  # filtrare exactă
    search_fields = ['contract__nr_contract', 'contract__arendator__nume', 'contract__arendator__cnp']  # ← FIXAT!      # căutare parțială
    ordering_fields = ['id_aditionale','data_aditionale', 'contract']      # sortare

class ZoneViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Zone.objects.all()
    serializer_class = ZoneSerializer

class TerenuriViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['arendator__nume']
    queryset = Terenuri.objects.select_related('contract', 'arendator', 'zona').all()
    serializer_class = TerenuriSerializer

    # @action(detail=False, methods=['get'], url_path='list_terenuri')
    # def list_terenuri(self, request):
    #     """
    #     Custom action: GET /api/terenuri/list_terenuri/
    #     Returnează terenuri cu date agregate (arendator, contract, zona)
    #     Optimized: SQL direct cu JOIN pentru a evita N+1 queries
    #     """
    #     from django.db import connection
        
    #     cursor = connection.cursor()
        
    #     # Query cu JOIN-uri pentru date complete
    #     cursor.execute("""
    #         SELECT t.id_teren,
    #             t.id_contract,
    #             t.id_arendator,
    #             t.id_zona,
    #             t.suprafata,
    #             a.nume AS nume_arendator,
    #             a.cnp AS cnp_arendator,
    #             c.nr_contract,
    #             c.data_contract,
    #             z.nume AS zona_nume
    #         FROM terenuri t
    #         LEFT JOIN arendatori a ON a.id_arendator = t.id_arendator
    #         LEFT JOIN contracte c ON c.id_contract = t.id_contract
    #         LEFT JOIN zone z ON z.id_zona = t.id_zona
    #         ORDER BY t.id_teren DESC
    #     """)
        
    #     columns = [col[0] for col in cursor.description]
    #     rows = cursor.fetchall()
        
    #     result = [dict(zip(columns, row)) for row in rows]
        
    #     return Response({
    #         'count': len(result),
    #         'results': result
    #     })

    # def create(self, request, *args, **kwargs):
    #     """Validare personalizată pentru Terenuri"""
    #     data = request.data

    #     # Lista de câmpuri obligatorii
    #     required_fields = [
    #         'id_contract', 'id_arendator', 'id_zona',
    #         'act_proprietate', 'nr_act_proprietate', 'suprafata',
    #         'tarla', 'parcela',  'categorie_teren'
    #     ]

    #     # Verifică fiecare câmp obligatoriu
    #     for field in required_fields:
    #         value = data.get(field, '')
            
    #         # Pentru IntegerField, trebuie să fie mai mare decât 0
    #         if field in ['id_contract', 'id_arendator', 'id_zona']:
    #             if not value or (isinstance(value, int) and value <= 0):
    #                 return Response(
    #                     {"error": f"{field} este obligatoriu și trebuie să fie un ID valid (> 0)"},
    #                     status=status.HTTP_400_BAD_REQUEST
    #                 )
    #         # Pentru CharField, trebuie să nu fie gol
    #         else:
    #             if not str(value).strip():
    #                 return Response(
    #                     {"error": f"{field} este obligatoriu și nu poate fi gol"},
    #                     status=status.HTTP_400_BAD_REQUEST
    #                 )

    #     # Validează că contractul și arendatorul există
    #     if not Contracte.objects.filter(contract_id=data.get('id_contract')).exists():
    #         return Response(
    #             {"error": f"Contractul cu ID {data.get('id_contract')} nu există"},
    #             status=status.HTTP_404_NOT_FOUND
    #         )
        
    #     if not Arendatori.objects.filter(id_arendator=data.get('id_arendator')).exists():
    #         return Response(
    #             {"error": f"Arendatorul cu ID {data.get('id_arendator')} nu există"},
    #             status=status.HTTP_404_NOT_FOUND
    #         )

    #     # Validează zona
    #     if not Zone.objects.filter(id_zona=data.get('id_zona')).exists():
    #         return Response(
    #             {"error": f"Zona cu ID {data.get('id_zona')} nu există"},
    #             status=status.HTTP_404_NOT_FOUND
    #         )

    #     # Dacă totul e OK, apelează parent create()
    #     return super().create(request, *args, **kwargs)

class ArendaViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Arenda.objects.all()
    serializer_class = ArendaSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['contract_id', 'an_arenda']

    def create(self, request, *args, **kwargs):
        id_contract = request.data.get('id_contract')
        an_arenda = request.data.get('an_arenda') or request.data.get('an')
        nivel_lei = request.data.get('nivel_lei')

        if not id_contract or not an_arenda or not nivel_lei:
            return Response(
                {"error": "id_contract, an_arenda și nivel_lei sunt obligatorii"},
                status=status.HTTP_400_BAD_REQUEST
            )

        arenda = Arenda.objects.filter(
            contract_id=id_contract,
            an_arenda=an_arenda
        ).first()

        if arenda:
            serializer = self.get_serializer(arenda)
            return Response(serializer.data, status=status.HTTP_200_OK)

        # Creează arenda nouă
        try:
            contract_obj = Contracte.objects.get(id_contract=id_contract)
        except Contracte.DoesNotExist:
            return Response({"error": "Contractul nu există"}, status=status.HTTP_404_NOT_FOUND)

        arenda = Arenda.objects.create(
            contract=contract_obj,
            an_arenda=an_arenda,
            nivel_lei=nivel_lei,
            status='neachitat'
        )
        
        serializer = self.get_serializer(arenda)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

  

            
class PlatiArendaViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = PlatiArenda.objects.select_related('arenda__contract__arendator').all()
    serializer_class = PlatiArendaSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['arenda_id']
    search_fields = ['arenda__contract__arendator__cnp', 'arenda__contract__arendator__nume']
    ordering_fields = ['id_plata', 'data_generarii', 'valoare_lei']
  
        
    def perform_update(self, serializer):
        plata = serializer.save()
        if plata.arenda:
            plata.arenda.update_status()
          
    

    def create(self, request, *args, **kwargs):
        data = request.data
        id_arenda = data.get('id_arenda')
        tip_plata = data.get('tip_plata')
        cantitate = data.get('cantitate')

        if not id_arenda or not tip_plata or not cantitate:
            return Response(
                {"error": "id_arenda, tip_plata și cantitate sunt obligatorii"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            arenda = Arenda.objects.get(id_arenda=id_arenda)
        except Arenda.DoesNotExist:
            return Response({"error": "Arenda nu există"}, status=status.HTTP_404_NOT_FOUND)

        contract = arenda.contract
        suprafata_totala = Terenuri.objects.filter(
            contract_id=contract.id_contract
        ).aggregate(Sum('suprafata'))['suprafata__sum'] or 0

        try:
            suprafata_totala = Decimal(str(suprafata_totala))
            cantitate = Decimal(str(cantitate))
            nivel_lei = Decimal(str(arenda.nivel_lei))
        except Exception:
            return Response({"error": "Date numerice invalide"}, status=status.HTTP_400_BAD_REQUEST)

        if tip_plata == 'lei':
            pret_kg = None
            valoare_lei = cantitate
        else:
            try:
                nivel_arenda = Decimal('1000') #Decimal(str(contract.nivel_arenda))
            except Exception:
                return Response({"error": "Nivel arenda din contract invalid"}, status=status.HTTP_400_BAD_REQUEST)

            if nivel_arenda <= 0:
                return Response({"error": "Nivel arenda trebuie să fie > 0"}, status=status.HTTP_400_BAD_REQUEST)

            pret_kg = nivel_lei / nivel_arenda
            valoare_lei = cantitate * pret_kg

        valoare_maxima = nivel_lei * suprafata_totala

        total_platit = PlatiArenda.objects.filter(
            arenda=arenda
        ).exclude(status='anulata').aggregate(Sum('valoare_lei'))['valoare_lei__sum'] or 0

        total_platit = Decimal(str(total_platit))

        if total_platit + valoare_lei > valoare_maxima:
            return Response(
                {"error": f"Depășire nivel arendă. Maxim: {valoare_maxima} lei"},
                status=status.HTTP_400_BAD_REQUEST
            )

        plata = PlatiArenda.objects.create(
            uuid=str(uuid4()),
            arenda=arenda,
            tip_plata=tip_plata,
            cantitate=cantitate,
            pret_kg=pret_kg,
            valoare_lei=valoare_lei,
            metoda_plata=data.get('metoda_plata'),
            observatii=data.get('observatii', ''),
            created_at=data.get('created_at') or None,
            status='generata'
        )

        # Actualizează status-ul arendei
        if plata.arenda:
            plata.arenda.update_status()

        serializer = self.get_serializer(plata)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='raport')
    def raport(self, request):
         data_inceput=request.query_params.get('data_inceput')
         data_sfarsit=request.query_params.get('data_sfarsit')
         if not data_inceput or not data_sfarsit:
                return Response(
                    {"error": "data_inceput și data_sfarsit sunt obligatorii"},
                    status=status.HTTP_400_BAD_REQUEST
                )
         queryset = self.queryset.filter(data_plata__date__range=(data_inceput, data_sfarsit)).exclude(status='anulata')
         total_valoare = queryset.aggregate(Sum('valoare_lei'))['valoare_lei__sum'] or 0
         count = queryset.count()
         return Response({"total_valoare": total_valoare, "count": count}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='(?P<uuid>[^/.]+)/details')
    def get_details(self, request, uuid=None):
        """
        Endpoint pentru detalii complete plată cu qr,contract și arendator
        GET /api/plati-arenda/{uuid}/details/
        """
        try:

            # caută plata după uuid (.get(uuid=uuid)),
            # și preîncarcă relațiile arenda și contract într-un singur query (select_related('arenda__contract')), 
            # ca să nu mai facă query-uri separate când accesezi plata.arenda și plata.arenda.contract.
         
            # "arenda__contract" este calea relațiilor în Django:

            # PlatiArenda are FK către Arenda → numit arenda
            # Arenda are FK către Contracte → numit contract
            # arenda__contract înseamnă: din PlatiArenda → arenda → contract
            # Prin select_related('arenda__contract'), Django face un singur SQL JOIN ca să aducă direct datele din Arenda și Contracte.
           
            plata = PlatiArenda.objects.select_related(
                'arenda__contract'
            ).get(uuid=uuid)
            
            # Obține detalii arendator din relația FK deja disponibilă
            arendator = plata.arenda.contract.arendator

            data = {
                'uuid': plata.uuid,
                'id_plata': plata.id_plata,
                'tip_plata': plata.tip_plata,
                'cantitate': float(plata.cantitate),
                'valoare_lei': float(plata.valoare_lei),
                'pret_kg': float(plata.pret_kg) if plata.pret_kg else None,
                'status': plata.status,
                'data_generarii': plata.data_generarii.isoformat(),
                'metoda_plata': plata.metoda_plata,
                'observatii': plata.observatii,
                'oblio_status': plata.oblio_status,
                'oblio_invoice_id': plata.oblio_invoice_id,
                'oblio_submitted_at': plata.oblio_submitted_at.isoformat() if plata.oblio_submitted_at else None,
                'arenda': {
                    'id_arenda': plata.arenda.id_arenda,
                    'an_arenda': plata.arenda.an_arenda,
                    'nivel_lei': plata.arenda.nivel_lei,
                    'contract': {
                        'nr_contract': plata.arenda.contract.nr_contract,
                        'data_contract': plata.arenda.contract.data_contract.strftime('%d.%m.%Y'),
                        'arendator': {
                            'nume': arendator.nume if arendator else 'N/A',
                            'cnp': arendator.cnp if arendator else 'N/A',
                            'telefon': arendator.telefon if arendator else 'N/A',
                        }
                    }
                }
            }
            
            return Response(data, status=status.HTTP_200_OK)
            
        except PlatiArenda.DoesNotExist:
            return Response(
                {"error": "Plata nu a fost găsită"},
                status=status.HTTP_404_NOT_FOUND
            )

     # în PlatiArendaViewSet
    @action(detail=False, methods=['post'], url_path='(?P<uuid>[^/.]+)/mark-paid')
    def mark_paid(self, request, uuid=None):
        # 1. Validare format UUID (rejectăm input malformat înainte de DB query)
        from uuid import UUID
        try:
            UUID(uuid)
        except (ValueError, TypeError):
            return Response(
                {"error": "UUID invalid"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        try: 
            # //Primește uuid din URL
            plata = PlatiArenda.objects.select_related('arenda__contract').get(uuid=uuid) #Caută plata după uuid
        except PlatiArenda.DoesNotExist:
            return Response({"error": "Plata nu a fost găsită"}, status=status.HTTP_404_NOT_FOUND)

        if plata.status == 'platita':
            return Response({"message": "Plata este deja marcată ca plătită"}, status=status.HTTP_200_OK)

        if plata.status == 'anulata':
            return Response({"error": "Plata este anulată și nu poate fi marcată ca plătită"}, status=status.HTTP_400_BAD_REQUEST)

        # opțional: validare că are valoare_lei > 0
        if plata.valoare_lei is None or plata.valoare_lei <= 0:
            return Response({"error": "Plata invalidă (valoare_lei <= 0)"}, status=status.HTTP_400_BAD_REQUEST)
        
        # 4. (FUTURE-PROOF) când vei avea ownership pe Contracte:
        # if plata.arenda.contract.user != request.user:
        #       return Response({"error": "Nu aveți permisiunea de a modifica această plată"}, status=status.HTTP_403_FORBIDDEN)  
        
        # actualizare status + data_plata
        plata.status = 'platita'
        if hasattr(plata, 'data_plata'):
            plata.data_plata = timezone.now()

        plata.save()
        plata.arenda.update_status()  # Actualizează status-ul arendei după plata

        serializer = self.get_serializer(plata)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def destroy(self, request, *args, **kwargs):
        """
        Override DELETE pentru a actualiza status arendei după ștergere
        """
        plata = self.get_object()
        arenda = plata.arenda  # Salvează referința înainte de ștergere
        
        # Șterge plata
        response = super().destroy(request, *args, **kwargs)
        
        # Actualizează status-ul arendei
        if arenda:
            arenda.update_status()
        
        return response
    
    @action(detail=False, methods=['get'], url_path='lista_plati')
    def lista_plati(self, request):
        nr_contract = request.GET.get('nr_contract', '').strip()
        data_contract = request.GET.get('data_contract', '').strip()

        if not nr_contract or not data_contract:
            return Response(
                {"error": "nr_contract și data_contract sunt obligatorii"},
                status=status.HTTP_400_BAD_REQUEST
            )

      
            
        plati = (
                PlatiArenda.objects
                .select_related('arenda__contract__arendator')
                .filter(
                    arenda__contract__nr_contract=nr_contract,
                    arenda__contract__data_contract=data_contract,
                )
                .order_by('-data_generarii')
            )

        results = [
                {
                    'id_plata': p.id_plata,
                    'uuid': p.uuid,
                    'tip_plata': p.tip_plata,
                    'cantitate': p.cantitate,
                    'valoare_lei': p.valoare_lei,
                    'pret_kg': p.pret_kg,
                    'status': p.status,
                    'data_generarii': p.data_generarii,
                    'data_plata': p.data_plata,
                    'nr_contract': p.arenda.contract.nr_contract,
                    'data_contract': p.arenda.contract.data_contract.strftime('%d.%m.%Y'),
                    'nume_arendator': p.arenda.contract.arendator.nume,
                    'cnp_arendator': p.arenda.contract.arendator.cnp,
                    'an_arenda': p.arenda.an_arenda,
                }
                for p in plati
            ]

        return Response({'results': results}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='(?P<uuid>[^/.]+)/emit-oblio')
    def emit_oblio(self, request, uuid=None):
        """
        POST /api/plati-arenda/{uuid}/emit-oblio/
        Emite factura in Oblio pentru plata identificata prin UUID.
        """
        def append_audit(plata_obj, action_name, status_value, extra=None):
            trail = plata_obj.invoice_audit_trail or {"events": []}
            if not isinstance(trail, dict):
                trail = {"events": []}
            events = trail.get("events")
            if not isinstance(events, list):
                events = []
            item = {
                "at": timezone.now().isoformat(),
                "action": action_name,
                "status": status_value,
            }
            if extra:
                item.update(extra)
            events.append(item)
            trail["events"] = events
            plata_obj.invoice_audit_trail = trail

        try:
            plata = PlatiArenda.objects.select_related("arenda__contract__arendator").get(uuid=uuid)
        except PlatiArenda.DoesNotExist:
            return Response({"error": "Plata nu a fost gasita"}, status=status.HTTP_404_NOT_FOUND)

        # Idempotent: daca exista deja factura, nu mai emite inca o data
        if plata.oblio_invoice_id:
            append_audit(
                plata,
                "EMIT_SKIPPED_ALREADY_EXISTS",
                plata.oblio_status or "SUBMITTED",
                {"oblio_invoice_id": plata.oblio_invoice_id},
            )
            plata.save(update_fields=["invoice_audit_trail", "updated_at"])
            return Response(
                {
                    "message": "Factura Oblio exista deja pentru aceasta plata",
                    "oblio_invoice_id": plata.oblio_invoice_id,
                    "oblio_status": plata.oblio_status,
                },
                status=status.HTTP_200_OK,
            )

        # Folosim UUID-ul platii ca idempotency key daca nu exista deja
        if not plata.invoice_idempotency_key:
            plata.invoice_idempotency_key = str(plata.uuid)

        contract = plata.arenda.contract
        arendator = getattr(contract, "arendator", None)

        if arendator is None:
            plata.oblio_status = "FAILED"
            plata.oblio_error = "Arendator lipsa pe contract"
            append_audit(plata, "EMIT_FAILED", "FAILED", {"reason": "missing_arendator"})
            plata.save(
                update_fields=[
                    "invoice_idempotency_key",
                    "oblio_status",
                    "oblio_error",
                    "invoice_audit_trail",
                    "updated_at",
                ]
            )
            return Response({"error": "Arendator lipsa pe contract"}, status=status.HTTP_400_BAD_REQUEST)

        # 1) Token OAuth2 de la Oblio
        token_url = "https://www.oblio.eu/api/authorize/token"
        token_payload = {
            "client_id": settings.OBLIO_CLIENT_ID,
            "client_secret": settings.OBLIO_CLIENT_SECRET,
        }

        try:
            token_resp = requests.post(token_url, data=token_payload, timeout=30)
            token_resp.raise_for_status()
            token_data = token_resp.json()
            access_token = token_data.get("access_token")
            if not access_token:
                raise ValueError("Nu s-a primit access_token de la Oblio")
        except Exception as exc:
            plata.oblio_status = "FAILED"
            plata.oblio_error = f"Token error: {str(exc)}"
            append_audit(plata, "EMIT_FAILED", "FAILED", {"step": "token"})
            plata.save(
                update_fields=[
                    "invoice_idempotency_key",
                    "oblio_status",
                    "oblio_error",
                    "invoice_audit_trail",
                    "updated_at",
                ]
            )
            return Response({"error": plata.oblio_error}, status=status.HTTP_502_BAD_GATEWAY)

        # 2) Emite factura in Oblio
        invoice_url = "https://www.oblio.eu/api/docs/invoice"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json",
        }

        # Ajusteaza campurile in functie de configuratia ta Oblio:
        # - OBLIO_COMPANY_CIF
        # - OBLIO_SERIES_NAME
        # - denumire produs/serviciu
        invoice_payload = {
            "cif": settings.OBLIO_COMPANY_CIF,
            "seriesName": settings.OBLIO_SERIES_NAME,
            "issueDate": plata.created_at.strftime('%Y-%m-%d'),
            "issuerName": "Dorel Nechifor",
            "client": {
                "name": arendator.nume or "Client fara nume",
                "cif": arendator.cnp or "",
                "phone": arendator.telefon or "",
                "vatPayer": False,
                "address":arendator.adresa or  "",
                "city": "Iasi",
                "state": "Iasi",
                "country": "Romania",
                "save": 1,
            },
            "products": [
                {
                    "name": f" {(plata.tip_plata).capitalize()} productie {plata.arenda.an_arenda}",
                    "description": f"Conform contract arenda {contract.nr_contract}/{contract.data_contract.strftime('%d.%m.%Y')}",
                    "price": float(plata.pret_kg),
                    "quantity": float(plata.cantitate),
                    "measuringUnit": "kg",
                    "vatPercentage": 11,
                    "vatIncluded": 0,
                    "productType": "Produse agricole",
                }
            ],
            "idempotencyKey": plata.invoice_idempotency_key,
        }

        try:
            emit_resp = requests.post(invoice_url, json=invoice_payload, headers=headers, timeout=30)
            emit_resp.raise_for_status()
            emit_data = emit_resp.json()

            data = emit_data.get("data", {}) if isinstance(emit_data, dict) else {}
            series_name = data.get("seriesName")
            number = data.get("number")
            link = data.get("link")

            # ID local simplu derivat din serie+numar
            invoice_id = f"{series_name}-{number}" if series_name and number else f"OBLIO-{plata.id_plata}"

            plata.oblio_invoice_id = invoice_id
            plata.oblio_status = "SUBMITTED"
            plata.oblio_error = None
            plata.oblio_submitted_at = timezone.now()

            append_audit(
                plata,
                "EMIT_SUCCESS",
                "SUBMITTED",
                {
                    "oblio_invoice_id": invoice_id,
                    "oblio_link": link,
                },
            )

            plata.save(
                update_fields=[
                    "invoice_idempotency_key",
                    "oblio_invoice_id",
                    "oblio_status",
                    "oblio_error",
                    "oblio_submitted_at",
                    "invoice_audit_trail",
                    "updated_at",
                ]
            )

            return Response(
                {
                    "message": "Factura emisa cu succes in Oblio",
                    "id_plata": plata.id_plata,
                    "uuid": str(plata.uuid),
                    "oblio_invoice_id": plata.oblio_invoice_id,
                    "oblio_status": plata.oblio_status,
                    "oblio_link": link,
                    "oblio_submitted_at": plata.oblio_submitted_at.isoformat() if plata.oblio_submitted_at else None,
                },
                status=status.HTTP_200_OK,
            )

        except requests.RequestException as exc:
            response = getattr(exc, "response", None)
            response_text = response.text[:1500] if response is not None and response.text else ""
            response_status = response.status_code if response is not None else None

            plata.oblio_status = "FAILED"
            plata.oblio_error = (
                f"Emit request error"
                f"{f' HTTP {response_status}' if response_status else ''}: "
                f"{response_text or str(exc)}"
            )

            append_audit(
                plata,
                "EMIT_FAILED",
                "FAILED",
                {
                    "step": "emit",
                    "http_status": response_status,
                    "response_body": response_text,
                },
            )

            plata.save(
                update_fields=[
                    "invoice_idempotency_key",
                    "oblio_status",
                    "oblio_error",
                    "invoice_audit_trail",
                    "updated_at",
                ]
            )

            return Response(
                {"error": plata.oblio_error},
                status=status.HTTP_502_BAD_GATEWAY,
            )
            
class ConfigAnViewSet(viewsets.ModelViewSet):
    permission_classes=[IsAuthenticated]
    queryset=ConfigAn.objects.all().order_by('-an')
    serializer_class=ConfigAnSerializer
    filter_backends=[DjangoFilterBackend,OrderingFilter]
    filterset_fields=['an']
    ordering_fields=['an','created_at']