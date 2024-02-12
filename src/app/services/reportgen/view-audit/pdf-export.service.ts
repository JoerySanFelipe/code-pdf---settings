import { Injectable } from '@angular/core';
import { Audit } from 'src/app/models/audit/audit';
import pdfMake from 'pdfmake/build/pdfmake';

@Injectable({
  providedIn: 'root',
})
export class PdfExportService {
  constructor() {}

  async exportAuditAsPdf(audit: Audit) {
    const documentDefinition = await this.getDocumentDefinition(audit);
    this.createAndDownloadPdf(documentDefinition);
  }

  private async getDocumentDefinition(audit: Audit) {
    const logoImagePath = 'assets/images/logo.png';
    const logoImageDataURL = await this.getImageDataUrl(logoImagePath);

    const content = [
      { image: logoImageDataURL, width: 100, alignment: 'center' },
      { text: 'Audit Information', style: 'title', alignment: 'center' },
      '\n',
      { text: `Audit No: ${audit.id}`, style: 'header' },
      { text: 'Primary Details', style: 'subheader' },
      { text: `Component: ${audit.component}`, margin: [0, 5] },
      { text: `Action: ${audit.action}`, margin: [0, 5] },
      { text: `Timestamp: ${audit.timestamp}`, margin: [0, 5] },
      { text: `Description: ${audit.details}`, margin: [0, 5] },
      { text: 'User Details', style: 'subheader' },
      { text: `Email: ${audit.email}`, margin: [0, 5] },
      { text: `Role: ${audit.role}`, margin: [0, 5] },
    ];

    if (audit.component === 'TRANSACTION') {
      content.push(
        { text: 'Additional Details', style: 'subheader' },
        { text: `Type: ${audit.payload.type}`, margin: [0, 5] },
        {
          text: `Payment Status: ${audit.payload.payment.status}`,
          margin: [0, 5],
        }
      );

      if (audit.payload.details) {
        audit.payload.details.forEach((detail: any) => {
          content.push({
            text: `Message: "${detail.message}"`,
            margin: [0, 5],
          });
        });
      }

      if (audit.payload.orderList) {
        content.push({ text: 'Product Details', style: 'subheader' });

        audit.payload.orderList.forEach((product: any) => {
          content.push(
            { text: `Name: ${product.productName}`, margin: [0, 5] },
            { text: `Quantity: ${product.quantity}`, margin: [0, 5] },
            {
              text: `Amount: ${product.price * product.quantity}`,
              margin: [0, 5],
            }
          );
        });
      }
    }

    if (audit.component === 'INVENTORY') {
      content.push(
        { text: 'Product Details', style: 'subheader' },
        { text: `Name: ${audit.payload.name}`, margin: [0, 5] },
        { text: `Category: ${audit.payload.category}`, margin: [0, 5] },
        { text: 'Stock and Pricing Details', style: 'subheader' },
        { text: `Stocks Added: ${audit.payload.stocks}`, margin: [0, 5] },
        { text: `Cost: ${audit.payload.cost}`, margin: [0, 5] },
        { text: `Price: ${audit.payload.price}`, margin: [0, 5] }
      );
    }

    const styles = {
      title: { fontSize: 18, bold: true, alignment: 'center', margin: [0, 10] },
      header: { fontSize: 14, bold: true, margin: [0, 5] },
      subheader: { fontSize: 12, bold: true, margin: [0, 5] },
    };

    return {
      content: content,
      styles: styles,
    };
  }

  private async getImageDataUrl(imagePath: string): Promise<string> {
    const response = await fetch(imagePath);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private createAndDownloadPdf(documentDefinition: any) {
    pdfMake.createPdf(documentDefinition).download(`audit-info-report.pdf`);
  }
}
