import os
from datetime import datetime
from pathlib import Path
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
import logging

logger = logging.getLogger(__name__)

class PDFGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Configure les styles personnalisés pour le PDF"""
        # Style pour le titre principal
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.HexColor('#2563eb')
        ))
        
        # Style pour les sous-titres
        self.styles.add(ParagraphStyle(
            name='CustomHeading2',
            parent=self.styles['Heading2'],
            fontSize=16,
            spaceAfter=12,
            spaceBefore=20,
            textColor=colors.HexColor('#1e40af')
        ))
        
        # Style pour le texte normal
        self.styles.add(ParagraphStyle(
            name='CustomBody',
            parent=self.styles['Normal'],
            fontSize=11,
            spaceAfter=6,
            alignment=TA_JUSTIFY
        ))
        
        # Style pour les listes à puces
        self.styles.add(ParagraphStyle(
            name='CustomBullet',
            parent=self.styles['Normal'],
            fontSize=11,
            spaceAfter=4,
            leftIndent=20,
            bulletIndent=10
        ))
        
        # Style pour les métadonnées
        self.styles.add(ParagraphStyle(
            name='CustomMeta',
            parent=self.styles['Normal'],
            fontSize=9,
            spaceAfter=4,
            textColor=colors.HexColor('#6b7280')
        ))

    def generate_meeting_report_pdf(self, report_data: dict, file_id: str) -> str:
        """
        Génère un PDF à partir des données du rapport de réunion
        """
        try:
            # Créer le dossier PDF s'il n'existe pas
            pdf_dir = Path("pdfs")
            pdf_dir.mkdir(exist_ok=True)
            
            # Nom du fichier PDF
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            pdf_filename = f"{file_id}_rapport_{timestamp}.pdf"
            pdf_path = pdf_dir / pdf_filename
            
            # Créer le document PDF
            doc = SimpleDocTemplate(
                str(pdf_path),
                pagesize=A4,
                rightMargin=72,
                leftMargin=72,
                topMargin=72,
                bottomMargin=18
            )
            
            # Construire le contenu
            story = []
            
            # En-tête avec titre et métadonnées
            story.append(Paragraph("Compte rendu de Réunion", self.styles['CustomTitle']))
            story.append(Paragraph(f"Généré le {datetime.now().strftime('%d/%m/%Y à %H:%M')}", self.styles['CustomMeta']))
            story.append(Paragraph(f"ID du rapport: {file_id}", self.styles['CustomMeta']))
            story.append(Spacer(1, 20))
            
            # Résumé
            if report_data.get('summary'):
                story.append(Paragraph("Résumé", self.styles['CustomHeading2']))
                story.append(Paragraph(report_data['summary'], self.styles['CustomBody']))
                story.append(Spacer(1, 12))
            
            # Points clés
            if report_data.get('key_points') and report_data['key_points']:
                story.append(Paragraph("Points Clés", self.styles['CustomHeading2']))
                for point in report_data['key_points']:
                    if point.strip():
                        story.append(Paragraph(f"• {point}", self.styles['CustomBullet']))
                story.append(Spacer(1, 12))
            
            # Éléments d'action
            if report_data.get('action_items') and report_data['action_items']:
                story.append(Paragraph("Éléments d'Action", self.styles['CustomHeading2']))
                for item in report_data['action_items']:
                    if item.strip():
                        story.append(Paragraph(f"• {item}", self.styles['CustomBullet']))
                story.append(Spacer(1, 12))
            
            # Participants
            if report_data.get('participants') and report_data['participants']:
                story.append(Paragraph("Participants", self.styles['CustomHeading2']))
                for participant in report_data['participants']:
                    if participant.strip():
                        story.append(Paragraph(f"• {participant}", self.styles['CustomBullet']))
                story.append(Spacer(1, 12))
            
            # Décisions
            if report_data.get('decisions') and report_data['decisions']:
                story.append(Paragraph("Décisions", self.styles['CustomHeading2']))
                for decision in report_data['decisions']:
                    if decision.strip():
                        story.append(Paragraph(f"• {decision}", self.styles['CustomBullet']))
                story.append(Spacer(1, 12))
            
            # Prochaines étapes
            if report_data.get('next_steps'):
                story.append(Paragraph("Prochaines Étapes", self.styles['CustomHeading2']))
                story.append(Paragraph(report_data['next_steps'], self.styles['CustomBody']))
                story.append(Spacer(1, 12))
            
            # Pied de page
            story.append(Spacer(1, 30))
            story.append(Paragraph("---", self.styles['CustomMeta']))
            story.append(Paragraph("Généré par Compte rendus IA - proposé par IAHome", self.styles['CustomMeta']))
            story.append(Paragraph("Application de génération automatique de rapports de réunion", self.styles['CustomMeta']))
            
            # Construire le PDF
            doc.build(story)
            
            logger.info(f"PDF généré avec succès: {pdf_path}")
            return str(pdf_path)
            
        except Exception as e:
            logger.error(f"Erreur lors de la génération du PDF: {e}")
            raise e

    def get_pdf_info(self, pdf_path: str) -> dict:
        """
        Retourne les informations sur le fichier PDF généré
        """
        try:
            path = Path(pdf_path)
            if path.exists():
                return {
                    "filename": path.name,
                    "size": path.stat().st_size,
                    "created": datetime.fromtimestamp(path.stat().st_ctime).isoformat(),
                    "path": str(path)
                }
            return None
        except Exception as e:
            logger.error(f"Erreur lors de la récupération des infos PDF: {e}")
            return None

# Instance globale
pdf_generator = PDFGenerator()










