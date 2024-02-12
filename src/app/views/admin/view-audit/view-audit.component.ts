import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Audit } from 'src/app/models/audit/audit';
import { PdfExportService } from 'src/app/services/reportgen/view-audit/pdf-export.service';

@Component({
  selector: 'app-view-audit',
  templateUrl: './view-audit.component.html',
  styleUrls: ['./view-audit.component.css'],
})
export class ViewAuditComponent implements OnInit {
  _audit: Audit | null = null;

  constructor(
    private activatedRoute: ActivatedRoute,
    public location: Location,
    private pdfExportService: PdfExportService 
  ) {}

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      const auditLog = params['audit'];

      const audit: Audit = JSON.parse(auditLog);
      this._audit = audit;

      console.log('Transaction:', audit);
    });
  }

  formatAudit(audit: Audit) {
    return audit;
  }

  exportAsPdf() {
    if (this._audit) {
      this.pdfExportService.exportAuditAsPdf(this._audit);
    }
  }
}
