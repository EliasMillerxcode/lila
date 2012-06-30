import ornicar.scalalib._

import play.api.libs.json.JsValue
import play.api.libs.concurrent.Promise
import play.api.libs.iteratee.{ Iteratee, Enumerator }
import play.api.libs.iteratee.Concurrent.Channel
import play.api.Play
import play.api.Play.current

import com.novus.salat.{ Context, TypeHintFrequency, StringTypeHintStrategy }
import com.mongodb.casbah.commons.conversions.scala.RegisterJodaTimeConversionHelpers
import scalaz.effects.{ io, IO }

package object lila
    extends OrnicarValidation
    with OrnicarCommon
    with OrnicarRegex
    with OrnicarIO
    with scalaz.Identitys
    with scalaz.NonEmptyLists
    with scalaz.Strings
    with scalaz.Lists
    with scalaz.Booleans {

  type JsChannel = Channel[JsValue]
  type JsEnumerator = Enumerator[JsValue]
  type SocketPromise = Promise[(Iteratee[JsValue, _], JsEnumerator)]

  // custom salat context
  implicit val customSalatContext = new Context {
    val name = "Lila Context"
    override val typeHintStrategy = StringTypeHintStrategy(
      when = TypeHintFrequency.Never)
  } ~ { context ⇒
    context registerClassLoader Play.classloader
  }
  RegisterJodaTimeConversionHelpers()

  def !!(msg: String) = msg.failNel

  def nowMillis: Double = System.currentTimeMillis
  def nowSeconds: Int = (nowMillis / 1000).toInt

  implicit def richerMap[A, B](m: Map[A, B]) = new {
    def +?(bp: (Boolean, (A, B))): Map[A, B] = if (bp._1) m + bp._2 else m
  }

  def parseIntOption(str: String): Option[Int] = try {
    Some(java.lang.Integer.parseInt(str))
  }
  catch {
    case e: NumberFormatException ⇒ None
  }

  def parseFloatOption(str: String): Option[Float] = try {
    Some(java.lang.Float.parseFloat(str))
  }
  catch {
    case e: NumberFormatException ⇒ None
  }

  def printToFile(f: java.io.File)(op: java.io.PrintWriter ⇒ Unit): IO[Unit] = io {
    val p = new java.io.PrintWriter(f)
    try { op(p) } finally { p.close() }
  }

  def printToFile(f: String)(op: java.io.PrintWriter ⇒ Unit): IO[Unit] =
    printToFile(new java.io.File(f))(op)
}
