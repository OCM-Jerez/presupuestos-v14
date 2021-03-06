import { Injectable } from '@angular/core';

import gastosProgramaAreas from '../../assets/data/gastosProgramaAreas.json';
import gastosProgramaPoliticas from '../../assets/data/gastosProgramaPoliticas.json';
import gastosProgramaGruposProgramas from '../../assets/data/gastosProgramaGruposProgramas.json';
import gastosEconomicaArticulos from '../../assets/data/gastosEconomicaArticulos.json';
import gastosEconomicaConceptos from '../../assets/data/gastosEconomicaConceptos.json';

import { AvalaibleYearsService } from '../services/avalaibleYears.service';
import { IDataGasto } from '../commons/interfaces/dataGasto.interface';
import { asynForEach } from '../commons/util/util';

@Injectable({
  providedIn: 'root'
})
export class PrepareDataGastosService {
  private dataGasto: IDataGasto = <IDataGasto>{};

  constructor(
    private _avalaibleYearsService: AvalaibleYearsService,
  ) { }

  // Seleciona datos del año que se pasa como parametro
  async getYearDataJson(year: number) {
    const data = await import(`../../assets/data/${year}LiqGas.json`);
    return data.default;
  }

  // Itera por cada uno de los años disponibles para gastos
  async getDataAllYear(tipoClasificacion: string, sufijo?: string): Promise<any[]> {
    let rowData = [];
    const years = this._avalaibleYearsService.getYearsSelected();

    await asynForEach(years, async (year: number) => {
      const dataGas = await this.getDataYear(year, tipoClasificacion, sufijo);
      rowData = rowData.concat(...dataGas);
    });
    return rowData;
  }

  // Selecciona datos gastos de un año
  async getDataYear(year: number, tipoClasificacion: string, sufijo: string) {
    const result = [];

    this.dataGasto = {
      cod: `Cod${sufijo}`,
      des: `Des${sufijo}`,
      Iniciales: `Iniciales${year}`,
      Modificaciones: `Modificaciones${year}`,
      Definitivas: `Definitivas${year}`,
      GastosComprometidos: `GastosComprometidos${year}`,
      ObligacionesReconocidasNetas: `ObligacionesReconocidasNetas${year}`,
      Pagos: `Pagos${year}`,
      ObligacionesPendientePago: `ObligacionesPendientePago${year}`,
      RemanenteCredito: `RemanenteCredito${year}`,
    }

    await this.getYearDataJson(year).then(data => {
      Object.entries(data).forEach((currentValue) => {
        result.push({
          [this.dataGasto.cod]: currentValue[1][this.dataGasto.cod],
          [this.dataGasto.des]: currentValue[1][this.dataGasto.des],
          [this.dataGasto.Iniciales]: currentValue[1]['Iniciales'],
          [this.dataGasto.Modificaciones]: currentValue[1]['Modificaciones'],
          [this.dataGasto.Definitivas]: currentValue[1]['Definitivas'],
          [this.dataGasto.GastosComprometidos]: currentValue[1]['GastosComprometidos'],
          [this.dataGasto.ObligacionesReconocidasNetas]: currentValue[1]['ObligacionesReconocidasNetas'],
          [this.dataGasto.Pagos]: currentValue[1]['Pagos'],
          [this.dataGasto.ObligacionesPendientePago]: currentValue[1]['ObligacionesPendientePago'],
          [this.dataGasto.RemanenteCredito]: currentValue[1]['RemanenteCredito'],
        });
      });
    })

    switch (tipoClasificacion) {
      case 'gastosProgramaAreas':
        result.map(item => {
          item.CodPro = Math.floor((item.CodPro / 10000));
          item.DesPro = gastosProgramaAreas.find((area) => area.codigo === item.CodPro).descripcion;
        });
        break;
      case 'gastosProgramaPoliticas':
        result.map(item => {
          if (item.CodPro > 0) {
            item.CodPro = Math.floor((item.CodPro / 1000));
            item.DesPro = gastosProgramaPoliticas.find((politica) => politica.codigo === item.CodPro).descripcion;
          } else {
            // console.log(item);
          }
        });
        break;
      case 'gastosProgramaGrupos':
        result.map(item => {
          if (item.CodPro > 0) {
            item.CodPro = Math.floor((item.CodPro / 100));
            item.DesPro = gastosProgramaGruposProgramas.find((grupo) => grupo.codigo === item.CodPro).descripcion;
          } else {
            // console.log(item);
          }
        });
        break;
      case 'gastosEconomicaArticulos':
        result.map(item => {
          item.CodEco = Math.floor((item.CodEco / 1000));
          item.DesEco = gastosEconomicaArticulos.find((articulo) => articulo.codigo === item.CodEco).descripcion;
        });
        break;
      case 'gastosEconomicaConceptos':
        result.map(item => {
          item.CodEco = Math.floor((item.CodEco / 100));
          item.DesEco = gastosEconomicaConceptos.find((concepto) => concepto.codigo === item.CodEco).descripcion;
        });
        break;
    }
    return result;
  }

}
