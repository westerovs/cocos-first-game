import {_decorator, Component, Input, input, Vec3, EventMouse, Animation} from 'cc'

const {ccclass, property} = _decorator

export const BLOCK_SIZE = 40

@ccclass('PlayerController')
export class PlayerController extends Component {
  /**
   * Здесь мы добавили свойство с именем BodyAnim и разместили @property его выше.
   * Этот синтаксис называется: Декоратор. @propertyДекоратор позволяет редактору определять
   * тип BodyAnim компонента Animation и отображать его экспортированные свойства на панели Инспектора.
   * */
  @property(Animation)
  BodyAnim: Animation = null

  // используется для определения, прыгает ли игрок
  private _startJump: boolean = false
  // количество шагов, которые игрок сделает в прыжке, должно быть 1 или 2. определяется тем, какая кнопка мыши нажата
  private _jumpStep: number = 0

  // Время, прошедшее с начала текущего прыжка игрока. должно сбрасываться в 0 при каждом новом прыжке. когда достигает значения
  // `_jumpTime`, прыжок считается завершённым
  private _curJumpTime: number = 0
  // время, необходимое игроку для одного прыжка
  private _jumpTime: number = 0.3

  // текущая вертикальная скорость игрока, используется для вычисления значения Y позиции во время прыжка
  private _curJumpSpeed: number = 0
  // текущая позиция игрока, используется как начальная точка в физической формуле
  private _curPos: Vec3 = new Vec3()
  // перемещение, вычисленное на основе deltaTime
  private _deltaPos: Vec3 = new Vec3(0, 0, 0)
  // хранит конечную позицию игрока. когда прыжок завершается, используется напрямую, чтобы избежать накопления ошибок вычислений
  private _targetPos: Vec3 = new Vec3()

  start() {
    input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this)
  }

  update(deltaTime: number) {
    // выполняем логику только если игрок сейчас прыгает
    if (!this._startJump) return

    // накапливаем время прыжка
    this._curJumpTime += deltaTime

    // проверяем, достигло ли время длительности прыжка
    if (this._curJumpTime > this._jumpTime) {

      // когда прыжок завершён - устанавливаем позицию игрока в целевую точку
      this.node.setPosition(this._targetPos)

      // сбрасываем состояние прыжка
      this._startJump = false
    } else {
      // если прыжок ещё продолжается копируем текущую позицию ноды
      this.node.getPosition(this._curPos)

      // вычисляем смещение по X через deltaTime и скорость прыжка
      this._deltaPos.x = this._curJumpSpeed * deltaTime

      // прибавляем смещение к текущей позиции
      Vec3.add(this._curPos, this._curPos, this._deltaPos)

      // обновляем позицию игрока
      this.node.setPosition(this._curPos)
    }
  }

  onMouseUp(event: EventMouse) {
    if (event.getButton() === EventMouse.BUTTON_LEFT) this.jumpByStep(1)
    else if (event.getButton() === EventMouse.BUTTON_RIGHT) this.jumpByStep(2)
  }

  jumpByStep(step: number) {
    if (this._startJump) return

    this._startJump = true // помечаем, что игрок начал прыжок
    this._jumpStep = step // сохраняем количество шагов, которое должен пройти прыжок
    this._curJumpTime = 0 // сбрасываем таймер текущего прыжка
    // т.к прыжок должен завершиться за фиксированное время (_jumpTime), рассчитываем вертикальную скорость прыжка
    this._curJumpSpeed = (this._jumpStep * BLOCK_SIZE) / this._jumpTime
    // сохраняем текущую позицию ноды - она будет использоваться в расчётах движения
    this.node.getPosition(this._curPos)
    // вычисляем конечную позицию ноды, которая будет установлена после завершения прыжка
    Vec3.add(this._targetPos, this._curPos, new Vec3(this._jumpStep * BLOCK_SIZE, 0, 0))

    this.#setJumpTime(step)

    if (this.BodyAnim) {
      if (step === 1) {
        this.BodyAnim.play('oneStep');
      } else if (step === 2) {
        this.BodyAnim.play('twoStep');
      }
    }
  }

  #setJumpTime = (step: number) => {
    const clipName = (step == 1) ? 'oneStep' : 'twoStep'
    console.group('↓---------clipName------↓')
    console.log(step)
    console.log(clipName)
    console.log('↑---------------↑')
    console.groupEnd()
    const state = this.BodyAnim.getState(clipName)
    this._jumpTime = state.duration
  }

}


