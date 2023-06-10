import { NgModule, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router'
import { HomePageComponent } from './home-page/home-page.component';
import { CatalogPageComponent } from './catalog-page/catalog-page.component';
import { HistoryPageComponent } from './history-page/history-page.component';
import { ReturnPageComponent } from './return-page/return-page.component';

const routes: Routes = [
  { path: "", component: HomePageComponent },
  { path: "katalog", component: CatalogPageComponent },
  { path: "historia", component: HistoryPageComponent },
  { path: "zwrot", component: ReturnPageComponent }
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }
