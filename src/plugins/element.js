import Vue from 'vue'
import {
  Aside,
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Card,
  Col,
  Container,
  Form,
  FormItem,
  Header,
  Input,
  Main,
  Menu,
  MenuItem,
  MenuItemGroup,
  Message,
  Pagination,
  Row,
  Submenu,
  Switch,
  Table,
  TableColumn,
  Tooltip,
  Dialog,
  MessageBox,
  Tag,
  Tree,
  Select,
  Option
} from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Menu)
Vue.use(MenuItem)
Vue.use(MenuItemGroup)
Vue.use(Submenu)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Card)
Vue.use(Row)
Vue.use(Col)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Pagination)
Vue.use(Switch)
Vue.use(Tooltip)
Vue.use(Dialog)
Vue.use(Tag)
Vue.use(Tree)
Vue.use(Select)
Vue.use(Option)
Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm
