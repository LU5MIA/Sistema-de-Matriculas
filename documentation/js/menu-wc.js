'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">Frontend - Sistema de Matrículas</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                                <li class="link">
                                    <a href="overview.html" data-type="chapter-link">
                                        <span class="icon ion-ios-keypad"></span>Overview
                                    </a>
                                </li>

                            <li class="link">
                                <a href="index.html" data-type="chapter-link">
                                    <span class="icon ion-ios-paper"></span>
                                        README
                                </a>
                            </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>

                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-AppModule-d81bdcfe116d2aa5e85e57b40cccda284220fb7a63a1e34f0c6cb6d13be6bc7b8eb8f7c307f9c2c22c4a519f7ce7ef2b639bed898b23a4de4f410d35a5161d26"' : 'data-bs-target="#xs-components-links-module-AppModule-d81bdcfe116d2aa5e85e57b40cccda284220fb7a63a1e34f0c6cb6d13be6bc7b8eb8f7c307f9c2c22c4a519f7ce7ef2b639bed898b23a4de4f410d35a5161d26"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppModule-d81bdcfe116d2aa5e85e57b40cccda284220fb7a63a1e34f0c6cb6d13be6bc7b8eb8f7c307f9c2c22c4a519f7ce7ef2b639bed898b23a4de4f410d35a5161d26"' :
                                            'id="xs-components-links-module-AppModule-d81bdcfe116d2aa5e85e57b40cccda284220fb7a63a1e34f0c6cb6d13be6bc7b8eb8f7c307f9c2c22c4a519f7ce7ef2b639bed898b23a4de4f410d35a5161d26"' }>
                                            <li class="link">
                                                <a href="components/AlertaComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AlertaComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AppComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppRoutingModule.html" data-type="entity-link" >AppRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/AuthModule.html" data-type="entity-link" >AuthModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-AuthModule-c624cfb1a09367d0f15a188c0e2784b989485862ee1534bc470f75e7ecab6fa0dfac05785c83281aef94759daada474adad711bf140220ad74068352fc65b450"' : 'data-bs-target="#xs-components-links-module-AuthModule-c624cfb1a09367d0f15a188c0e2784b989485862ee1534bc470f75e7ecab6fa0dfac05785c83281aef94759daada474adad711bf140220ad74068352fc65b450"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AuthModule-c624cfb1a09367d0f15a188c0e2784b989485862ee1534bc470f75e7ecab6fa0dfac05785c83281aef94759daada474adad711bf140220ad74068352fc65b450"' :
                                            'id="xs-components-links-module-AuthModule-c624cfb1a09367d0f15a188c0e2784b989485862ee1534bc470f75e7ecab6fa0dfac05785c83281aef94759daada474adad711bf140220ad74068352fc65b450"' }>
                                            <li class="link">
                                                <a href="components/LoginComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LoginComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AuthRoutingModule.html" data-type="entity-link" >AuthRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/DashboardModule.html" data-type="entity-link" >DashboardModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-DashboardModule-26736cc4a66560f808f3f3b971e3bbf838ca23e111bb9d77d49ee39bee5cbc843c21e8485173758db4f3d3a6c1da8c1a4a430ab67f9256d553d6b8df95904d5a"' : 'data-bs-target="#xs-components-links-module-DashboardModule-26736cc4a66560f808f3f3b971e3bbf838ca23e111bb9d77d49ee39bee5cbc843c21e8485173758db4f3d3a6c1da8c1a4a430ab67f9256d553d6b8df95904d5a"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-DashboardModule-26736cc4a66560f808f3f3b971e3bbf838ca23e111bb9d77d49ee39bee5cbc843c21e8485173758db4f3d3a6c1da8c1a4a430ab67f9256d553d6b8df95904d5a"' :
                                            'id="xs-components-links-module-DashboardModule-26736cc4a66560f808f3f3b971e3bbf838ca23e111bb9d77d49ee39bee5cbc843c21e8485173758db4f3d3a6c1da8c1a4a430ab67f9256d553d6b8df95904d5a"' }>
                                            <li class="link">
                                                <a href="components/BancosComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BancosComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/BodyComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BodyComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DashboardLayoutComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DashboardLayoutComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EstudiantesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EstudiantesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MatriculasComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MatriculasComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/NavbarComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NavbarComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PadresComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PadresComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PagosComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PagosComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PanelControlComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PanelControlComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SaludComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SaludComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SidenavComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SidenavComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SublevelMenuComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SublevelMenuComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UsuariosComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsuariosComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/DashboardRoutingModule.html" data-type="entity-link" >DashboardRoutingModule</a>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#components-links"' :
                            'data-bs-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/AlertaComponent.html" data-type="entity-link" >AlertaComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ConfirmDialogComponent.html" data-type="entity-link" >ConfirmDialogComponent</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AlertaService.html" data-type="entity-link" >AlertaService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AulasService.html" data-type="entity-link" >AulasService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthService.html" data-type="entity-link" >AuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/EstudiantesService.html" data-type="entity-link" >EstudiantesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/InformacionMedicaService.html" data-type="entity-link" >InformacionMedicaService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MatriculasService.html" data-type="entity-link" >MatriculasService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PadresService.html" data-type="entity-link" >PadresService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PagosService.html" data-type="entity-link" >PagosService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RolesService.html" data-type="entity-link" >RolesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UsuariosService.html" data-type="entity-link" >UsuariosService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#guards-links"' :
                            'data-bs-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/AuthGuard.html" data-type="entity-link" >AuthGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/ApiError.html" data-type="entity-link" >ApiError</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Aulas.html" data-type="entity-link" >Aulas</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ConfirmDialogData.html" data-type="entity-link" >ConfirmDialogData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DetallePagoCreate.html" data-type="entity-link" >DetallePagoCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DetallePagoUpdate.html" data-type="entity-link" >DetallePagoUpdate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DetallesPago.html" data-type="entity-link" >DetallesPago</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EstudianteMedico.html" data-type="entity-link" >EstudianteMedico</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Estudiantes.html" data-type="entity-link" >Estudiantes</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EstudiantesCreate.html" data-type="entity-link" >EstudiantesCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/INavbarData.html" data-type="entity-link" >INavbarData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/InformacionMedica.html" data-type="entity-link" >InformacionMedica</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/InformacionMedicaCreate.html" data-type="entity-link" >InformacionMedicaCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Login.html" data-type="entity-link" >Login</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/LoginResponse.html" data-type="entity-link" >LoginResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MatriculaCreatePayload.html" data-type="entity-link" >MatriculaCreatePayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Matriculas.html" data-type="entity-link" >Matriculas</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MatriculasVista.html" data-type="entity-link" >MatriculasVista</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PadreMedico.html" data-type="entity-link" >PadreMedico</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Padres.html" data-type="entity-link" >Padres</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Pagos.html" data-type="entity-link" >Pagos</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PagosCreatePayload.html" data-type="entity-link" >PagosCreatePayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PagosVista.html" data-type="entity-link" >PagosVista</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PagoUpdatePayload.html" data-type="entity-link" >PagoUpdatePayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ParentForm.html" data-type="entity-link" >ParentForm</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Roles.html" data-type="entity-link" >Roles</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SideNavToggle.html" data-type="entity-link" >SideNavToggle</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SideNavToggle-1.html" data-type="entity-link" >SideNavToggle</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SideNavToggle-2.html" data-type="entity-link" >SideNavToggle</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Usuarios.html" data-type="entity-link" >Usuarios</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UsuariosCreate.html" data-type="entity-link" >UsuariosCreate</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});