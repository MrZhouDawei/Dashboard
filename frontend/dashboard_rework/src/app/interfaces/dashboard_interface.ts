import { Widget_interface} from './widget_interface';

type coords = [number, number];

export interface Dashboard_interface {
  name: string;
  helpDocUrl: string;
  helpDocHeight: number;
  helpDocWidth: number;
  pageTitle: string;
  coords: coords;
  lastModified: string;
  widgetsInUse: string[];
}
