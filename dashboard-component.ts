import { Component, ViewEncapsulation, ElementRef, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { serviceUrlList } from '../../enums/service-config';
import { HttpRequestsService } from '../../services/common/http-request.service';
import { PipesModule } from '../../core/pipes';
import { PipeService } from '../../services/PipeService';
import { PipeModel } from '../../Models/PipeModel';
import { ProjectModel } from '../../Models/ProjectModel';
import { MatTableDataSource } from '@angular/material/table';
import { TableModel } from '../../Models/TableModel';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { merge, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap, delay } from 'rxjs/operators';
import { TableService } from '../../services/table.service';
import { DataPipeAlertService } from '../alert/alert.service';
import { LoaderService } from '../loader/loader.service';


// @ts-ignore
@Component({
  selector: 'App-Dashboard',
  templateUrl: './dashboard-component.html',
  styleUrls: ['./Dashboard-component.scss']
})

export class DashboardComponent implements OnInit , AfterViewInit {
  tables: any[] = [];
  pipe: PipeModel[] = [];
  tableLabel: string;
  showPipeGrid: boolean = false;
  showProjectGrid: boolean = true;
  showTableGrid: boolean = false;
  public projectList: ProjectModel[] = [];
  public displayedColumns: string [] = [];
  public ELEMENT_PROJECT_DATA: ProjectModel[] = [];
  public ELEMENT_PIPE_DATA: PipeModel[] = [];
  public ELEMENT_TABLE_DATA: TableModel[] = [];
  isLoadingResults = false;
  isRateLimitReached = false;
  resultsLength = 0;
  showDataTableGridWithNav: boolean = false;
  public dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  @ViewChild(MatPaginator, { static: false }) public paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) public sort: MatSort;

  constructor(private pipeService: PipeService, private tableService: TableService, 
    private router: Router, private route: ActivatedRoute, private alertService: DataPipeAlertService, private loaderService: LoaderService) {

  }
  ngOnInit(): void {
    
    this.route.params.subscribe( params => {
      this.showDataTableGridWithNav = params.showDataTableGrid;
  });

 }
   ngAfterViewInit(): void {
     this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
     if(this.showDataTableGridWithNav){
      this.loaderService.show();
      this.getAllTables();
     } else {
      this.loaderService.show();
      this.showProjectsDataGrid();
     }
     this.pipeService.getAllProjects().subscribe(data=>{
      this.ELEMENT_PROJECT_DATA = data.data.ALL_PROJECTS;
    });
     this.pipeService.getAllPipes().subscribe(data=>{
    this.ELEMENT_PIPE_DATA = data.data.PIPES; 
    });
    this.tableService.getAllTable().subscribe( data=>{
      this.ELEMENT_TABLE_DATA = data.data;
    })
    }

  showProjectsDataGrid() {
  this.getAllProjects();
 }

 showTableDataGrid() {
  this.loaderService.show();
  this.getAllTables();
 }
 showPipeDataGrid() {
  this.loaderService.show();
   this.getAllPipes();
 }
  private extractProjectDetails(list: Array<ProjectModel>): Array<ProjectModel> {
    let values: Array<ProjectModel> = [];
    values = list;
    return  values;
  }
  private getAllProjects() {
    this.loaderService.show();
    this.pipeService.getAllProjects().subscribe(data=>{
      this.showPipeGrid = false;
      this.showProjectGrid = true;
      this.showTableGrid = false;
      this.isLoadingResults = false;
      this.displayedColumns = [ 'no', 'projectname', 'bucketfoldername'];
      this.tableLabel = "Projects"
      this.isRateLimitReached = false;
      this.resultsLength = data.data.ALL_PROJECTS.length;
      this.dataSource.data = data.data.ALL_PROJECTS;
      this.ELEMENT_PROJECT_DATA =  this.dataSource.data;
      this.dataSource.paginator = this.paginator;
      this.projectList = data;
      this.loaderService.hide();
    },
    err => {
      this.loaderService.hide();
      console.log("Unable to create a new project");
    });
   
  }
   
    private getAllPipes() {
      
      this.pipeService.getAllPipes().subscribe(data=>{
        this.displayedColumns = [ 'no', 'project','soucefilter', 'sourcedateformat','frequency','extractionMode','dataFormat','actions'];
        this.showPipeGrid = true;
        this.showProjectGrid = false;
        this.showTableGrid = false;
        this.tableLabel = 'Pipes';
        this.resultsLength = data.data.PIPES.length;
        this.dataSource.data = data.data.PIPES;
        this.ELEMENT_PIPE_DATA =  this.dataSource.data;
        this.dataSource.paginator = this.paginator;
        this.loaderService.hide();
      },
      err => {
        this.loaderService.hide();
        console.log("Unable to create a new project");
      });
      
    }

    private getAllTables() {
      this.loaderService.show();
      this.pipeService.getAllPipes().subscribe(data=>{
        this.displayedColumns = [ 'no', 'tableName', 'projectName','Origin','actions'];
        this.showPipeGrid = false;
        this.showProjectGrid = false;
        this.showTableGrid = true;
        this.tableLabel = 'Tables';
        this.resultsLength = this.ELEMENT_TABLE_DATA.length;
        this.dataSource.data =this.ELEMENT_TABLE_DATA;
        this.dataSource.paginator = this.paginator;
        this.showDataTableGridWithNav = false;
        this.loaderService.hide();
      },
      err => {
        this.loaderService.hide();
        console.log("Unable to create a new project");
      });
     
    }

    private deleteTable(element: any){
        this.tableService.deleteTable(element).subscribe(response=>{
          if(response.code == 200){
            this.alertService.alert(response.message,'Success','error');
            this.ELEMENT_TABLE_DATA = response.data;
            this.dataSource.data =this.ELEMENT_TABLE_DATA;
          }
        })
        
    }
    private fetchTableDetails(element: any){
        this.router.navigate(['home/table-details', element]);
    }

    private addNewField(element: any) {
      this.pipeService.addField = element;
      let data= {
        "dataTableId": element.dataTableId,
        "projectId": element.project.projectId
      }
      this.router.navigate(['home/add-fields', data]);
    }

    public editPipe(element: any){
      element.ProjectModel = element.dataTable.project;
      this.pipeService.editPipeModel = element;
      this.router.navigate(['/home/edit-pipe']);
    }
    public deletePipe(element: any){
      this.pipeService.deletePipe(element).subscribe(response =>{
        if(response.code == 200){
          this.alertService.alert(response.message,'Success','error');
        }
    },
    err => {
      this.loaderService.hide();
      console.log("Unable to create a new project");
    });
  }
}
