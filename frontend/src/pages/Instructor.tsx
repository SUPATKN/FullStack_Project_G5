import { Container } from "react-bootstrap";
import Layout from "../Layout";
import "bootstrap/dist/css/bootstrap.min.css";
import "../global.css";

const Instructor = () => {
  return (
    <Layout>
      <Container
        fluid
        className="team section d-flex justify-content-center align-items-start"
      >
        <div
          id="instructor"
          className="container-fluid team section  dark-background"
        >
          <div className="container-xl section-title text-center">
          <h3 className="mb-4 text-center text-[#ff8833] font-light letter-spacing-0-7px">INSTRUCTOR</h3>
                <p className="instructor-p mb-4">
                  Necessitatibus eius consequatur ex aliquid fuga eum quidem sint
                  consectetur velit
                </p>
          </div>
          <div className="container-xl">
            <div className="row gy-4">
              <div className="col-lg-6">
                <div className="team-member d-flex align-items-start">
                  <div className="pic">
                    <img
                      src="https://www.cpe.eng.cmu.ac.th/img/staff/Lecturer-20200626-135425.jpg"
                      className="img-fluid"
                      alt=""
                    />
                  </div>
                  <div className="instruction-info">
                    <div className="member-info text-light">
                      <h3 className="memtext">Dome Potikanond</h3>
                      <p>Instructor</p>
                      <hr />
                      <div className="social-gmail">
                      <i className="bi bi-phone" /> Phone
                        <a href="">
                          
                          {" "}
                          : (+66) 84-614000-6
                        </a>{" "}
                        <br />
                        E-mail :
                        <a
                          href="https://mail.google.com/mail/u/0/#search/dome.potikanond%40cmu.ac.th?compose=new"
                          target="blank"
                        >
                          {" "}
                          dome.potikanond@cmu.ac.th
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="team-member d-flex align-items-start">
                  <div className="pic">
                    <img
                      src="https://ie.eng.cmu.ac.th/_next/image?url=https%3A%2F%2Fieadmin.eng.cmu.ac.th%2Fwp-content%2Fuploads%2F2023%2F06%2F22NR2x3-1.jpg&w=1920&q=75"
                      className="img-fluid"
                      alt=""
                    />
                  </div>
                  <div className="instruction-info">
                    <div className="member-info text-light">
                      <h3 className="memtext">Nirand Pasutha-Arnond</h3>
                      <p>Instructor</p>
                      <hr />
                      <div className="social-gmail">
                        <i className="bi bi-phone" /> Phone
                        <a href="" className="">
                          {" "}
                          : (+66) 53-944125-6
                        </a>{" "}
                        <br />
                        E-mail :
                        <a
                          href="https://mail.google.com/mail/u/0/#search/nirand.p%40cmu.ac.th?compose=new"
                          target="blank"
                          className=""
                        >
                          {" "}
                          nirand.p@cmu.ac.th{" "}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Layout>
  );
};

export default Instructor;
