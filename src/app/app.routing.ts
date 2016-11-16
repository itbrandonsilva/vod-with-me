import { RoomComponent } from './room/room.component';
import { HomeComponent } from './home/home.component';
import { Routes, RouterModule } from "@angular/router";

const APP_ROUTES: Routes = [
    {
        path: 'room/:id',
        component: RoomComponent,
    },
    {
        path: '',
        component: HomeComponent,
    }
];

export const Routing = RouterModule.forRoot(APP_ROUTES);